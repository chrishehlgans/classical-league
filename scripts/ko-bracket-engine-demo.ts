/**
 * Explicit-input/output check harness for the KO bracket engine
 * (lib/ko-bracket-generator.ts — Chunk 2 of KO_TOURNAMENT_PLAN.md).
 *
 * There is no test runner configured in this repo yet, so instead of unit
 * tests this script feeds the pure engine functions a range of concrete
 * inputs and asserts on their outputs, printing a pass/fail summary. It exits
 * non-zero on any failure so it can still act as a gate.
 *
 * Run with: npx tsx scripts/ko-bracket-engine-demo.ts
 * (or: npm run ko:verify-bracket-engine)
 */

import {
  computeBracketSize,
  standardSeedOrder,
  assignSeeds,
  buildBracket,
  type SeededParticipant,
  type UnseededParticipant,
} from '../lib/ko-bracket-generator'
import type { KnockoutMatch } from '../lib/ko-tournament-types'

let checks = 0
let failures = 0

function assert(condition: boolean, message: string): void {
  checks++
  if (!condition) {
    failures++
    console.error(`  ✗ FAIL: ${message}`)
  }
}

function section(title: string): void {
  console.log(`\n=== ${title} ===`)
}

function makeParticipants(count: number): UnseededParticipant[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    rating: 2000 - i * 10,
  }))
}

// ---------------------------------------------------------------------------
// computeBracketSize
// ---------------------------------------------------------------------------
section('computeBracketSize')

const bracketSizeCases: Array<[number, number]> = [
  [2, 2],
  [3, 4],
  [4, 4],
  [5, 8],
  [8, 8],
  [9, 16],
  [16, 16],
  [17, 32],
  [100, 128],
]
for (const [input, expected] of bracketSizeCases) {
  const actual = computeBracketSize(input)
  console.log(`  computeBracketSize(${input}) = ${actual} (expected ${expected})`)
  assert(actual === expected, `computeBracketSize(${input}) should be ${expected}, got ${actual}`)
}

try {
  computeBracketSize(1)
  assert(false, 'computeBracketSize(1) should throw (need >= 2 participants)')
} catch {
  console.log('  computeBracketSize(1) correctly throws')
}

// ---------------------------------------------------------------------------
// standardSeedOrder
// ---------------------------------------------------------------------------
section('standardSeedOrder')

const seedOrderCases: Array<[number, number[]]> = [
  [2, [1, 2]],
  [4, [1, 4, 2, 3]],
  [8, [1, 8, 4, 5, 2, 7, 3, 6]],
]
for (const [size, expected] of seedOrderCases) {
  const actual = standardSeedOrder(size)
  console.log(`  standardSeedOrder(${size}) = [${actual.join(', ')}] (expected [${expected.join(', ')}])`)
  assert(JSON.stringify(actual) === JSON.stringify(expected), `standardSeedOrder(${size}) mismatch`)
}

// For every supported size, the order must be a permutation of 1..size and
// every match pairing (consecutive pair) must sum to size + 1 at the final
// fold level is NOT required in general, but each pair *within round 1* must
// contain one seed from the top half and one from the bottom half.
for (const size of [2, 4, 8, 16, 32, 64]) {
  const order = standardSeedOrder(size)
  const sorted = [...order].sort((a, b) => a - b)
  const isPermutation = sorted.every((v, i) => v === i + 1)
  assert(isPermutation, `standardSeedOrder(${size}) must be a permutation of 1..${size}, got [${order.join(', ')}]`)
  for (let i = 0; i < order.length; i += 2) {
    const seedA = order[i]
    const seedB = order[i + 1]
    const oneTopHalf = seedA <= size / 2 || seedB <= size / 2
    const oneBottomHalf = seedA > size / 2 || seedB > size / 2
    assert(oneTopHalf && oneBottomHalf, `standardSeedOrder(${size}) pair (${seedA}, ${seedB}) should span top/bottom half`)
  }
}

// ---------------------------------------------------------------------------
// assignSeeds
// ---------------------------------------------------------------------------
section('assignSeeds')

const ratingInput: UnseededParticipant[] = [
  { id: 'a', name: 'Charlie', rating: 1800 },
  { id: 'b', name: 'Alice', rating: 2100 },
  { id: 'c', name: 'Bob', rating: 2100 }, // tie with Alice -> broken by name
  { id: 'd', name: 'Dana', rating: 1500 }, // lowest rating -> seeded last
]
const ratingSeeded = assignSeeds(ratingInput, 'RATING')
console.log(
  '  RATING seeding:',
  ratingSeeded.map((participant) => `${participant.name}(seed ${participant.seed}, rating ${participant.rating})`).join(', ')
)
assert(ratingSeeded[0].id === 'b', 'highest rating (Alice, 2100) should be seed 1')
assert(ratingSeeded[1].id === 'c', 'tie broken alphabetically: Bob before Charlie/Alice-tie')
assert(ratingSeeded[3].id === 'd', 'participant with the lowest rating should be seeded last')
assert(
  ratingSeeded.every((participant, i) => participant.seed === i + 1),
  'RATING seeding should assign 1..N contiguously'
)

const manualInput: UnseededParticipant[] = [
  { id: 'x', name: 'X', rating: 2000 },
  { id: 'y', name: 'Y', rating: 1900 },
  { id: 'z', name: 'Z', rating: 1800 },
]
const manualSeeded = assignSeeds(manualInput, 'MANUAL', { manualSeeds: { x: 3, y: 1, z: 2 } })
console.log(
  '  MANUAL seeding:',
  manualSeeded.map((participant) => `${participant.name}(seed ${participant.seed})`).join(', ')
)
assert(manualSeeded[0].id === 'y' && manualSeeded[0].seed === 1, 'manual seed 1 should be Y')
assert(manualSeeded[2].id === 'x' && manualSeeded[2].seed === 3, 'manual seed 3 should be X')

try {
  assignSeeds(manualInput, 'MANUAL', { manualSeeds: { x: 1, y: 1, z: 2 } })
  assert(false, 'MANUAL seeding with a duplicate seed should throw')
} catch {
  console.log('  MANUAL seeding correctly rejects a duplicate seed')
}

const randomSeeded = assignSeeds(makeParticipants(10), 'RANDOM', { random: () => 0.5 })
assert(
  randomSeeded.every((participant, i) => participant.seed === i + 1),
  'RANDOM seeding should still assign a contiguous 1..N permutation'
)

// ---------------------------------------------------------------------------
// buildBracket — structural invariants across a spread of participant counts
// ---------------------------------------------------------------------------
section('buildBracket — structural invariants')

function flattenMatches(rounds: { matches: KnockoutMatch[] }[]): KnockoutMatch[] {
  return rounds.flatMap((r) => r.matches)
}

for (const n of [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 16, 20, 32]) {
  const seeded: SeededParticipant[] = assignSeeds(makeParticipants(n), 'RATING')
  const { bracketSize, byeCount, rounds } = buildBracket(seeded, { gamesPerRound: 2, idPrefix: `n${n}` })
  const allMatches = flattenMatches(rounds)

  assert(bracketSize === computeBracketSize(n), `n=${n}: bracketSize should equal computeBracketSize(n)`)
  assert(byeCount === bracketSize - n, `n=${n}: byeCount should equal bracketSize - n`)
  assert(allMatches.length === bracketSize - 1, `n=${n}: total matches should be bracketSize - 1, got ${allMatches.length}`)

  const round1 = rounds[0].matches
  const byeMatches = round1.filter((m) => m.result === 'BYE')
  assert(byeMatches.length === byeCount, `n=${n}: expected ${byeCount} Round 1 byes, got ${byeMatches.length}`)

  // Every bye winner must be one of the top `byeCount` seeds.
  const byeWinnerSeeds = byeMatches.map((m) => m.participant1?.seed ?? m.participant2?.seed).sort((a, b) => (a ?? 0) - (b ?? 0))
  const expectedTopSeeds = Array.from({ length: byeCount }, (_, i) => i + 1)
  assert(
    JSON.stringify(byeWinnerSeeds) === JSON.stringify(expectedTopSeeds),
    `n=${n}: bye winners should be exactly top seeds [${expectedTopSeeds.join(', ')}], got [${byeWinnerSeeds.join(', ')}]`
  )

  // No match should ever have two null participants in round 1 (real players only pad byes, never double-phantom).
  const doubleBye = round1.some((m) => m.participant1 === null && m.participant2 === null)
  assert(!doubleBye, `n=${n}: no Round 1 match should have two null participants`)

  // Every non-final match has a nextMatchId pointing at a real match in the following round,
  // with an alternating nextMatchSlot (1 for even index, 2 for odd index within its pair).
  for (let r = 0; r < rounds.length - 1; r++) {
    for (const match of rounds[r].matches) {
      assert(match.nextMatchId !== null, `n=${n}: round ${r + 1} match ${match.id} should have a nextMatchId`)
      const target = allMatches.find((m) => m.id === match.nextMatchId)
      assert(!!target, `n=${n}: match ${match.id}'s nextMatchId ${match.nextMatchId} should resolve to a real match`)
      assert(
        match.nextMatchSlot === 1 || match.nextMatchSlot === 2,
        `n=${n}: match ${match.id} nextMatchSlot should be 1 or 2, got ${match.nextMatchSlot}`
      )
    }
  }

  // Final round: exactly one match, no nextMatchId.
  const finalRound = rounds[rounds.length - 1]
  assert(finalRound.matches.length === 1, `n=${n}: final round should have exactly 1 match`)
  assert(finalRound.matches[0].nextMatchId === null, `n=${n}: final match should have no nextMatchId`)
  assert(finalRound.name === 'Final', `n=${n}: last round should be named "Final", got "${finalRound.name}"`)

  // Games: bye matches carry no games; real (undecided) matches carry exactly gamesPerRound placeholders.
  for (const match of allMatches) {
    if (match.result === 'BYE') {
      assert(match.games.length === 0, `n=${n}: bye match ${match.id} should have 0 games`)
    } else {
      assert(match.games.length === 2, `n=${n}: match ${match.id} should have 2 (gamesPerRound) placeholder games`)
      assert(
        match.games.every((g) => g.result === null),
        `n=${n}: ungenerated match ${match.id} games should all have a null result`
      )
    }
  }
}

// ---------------------------------------------------------------------------
// buildBracket — gamesPerRound validation
// ---------------------------------------------------------------------------
section('buildBracket — gamesPerRound validation')

const seeded8 = assignSeeds(makeParticipants(8), 'RATING')
for (const gamesPerRound of [1, 2, 4, 6]) {
  const result = buildBracket(seeded8, { gamesPerRound, idPrefix: `g${gamesPerRound}` })
  const firstRealMatch = result.rounds[0].matches.find((m) => m.result !== 'BYE')!
  assert(
    firstRealMatch.games.length === gamesPerRound,
    `gamesPerRound=${gamesPerRound}: expected ${gamesPerRound} games, got ${firstRealMatch.games.length}`
  )
}
for (const invalid of [0, 3, 5]) {
  try {
    buildBracket(seeded8, { gamesPerRound: invalid })
    assert(false, `gamesPerRound=${invalid} should be rejected (must be 1 or even)`)
  } catch {
    console.log(`  gamesPerRound=${invalid} correctly rejected`)
  }
}

// ---------------------------------------------------------------------------
// buildBracket — third-place match
// ---------------------------------------------------------------------------
section('buildBracket — third-place match')

const seeded16 = assignSeeds(makeParticipants(16), 'RATING')
const withThirdPlace = buildBracket(seeded16, { thirdPlaceMatch: true, idPrefix: 't16' })
assert(withThirdPlace.thirdPlaceMatchData !== null, '16-player bracket with thirdPlaceMatch:true should produce a match')
assert(
  withThirdPlace.thirdPlaceMatchData?.isThirdPlace === true,
  'third-place match should have isThirdPlace: true'
)
assert(
  withThirdPlace.thirdPlaceMatchData?.participant1 === null && withThirdPlace.thirdPlaceMatchData?.participant2 === null,
  'third-place match participants are unknown until the semifinal is played'
)

const seeded2 = assignSeeds(makeParticipants(2), 'RATING')
const twoPlayerThirdPlace = buildBracket(seeded2, { thirdPlaceMatch: true, idPrefix: 't2' })
assert(
  twoPlayerThirdPlace.thirdPlaceMatchData === null,
  '2-player bracket has no semifinal, so thirdPlaceMatch should stay null even if requested'
)

// ---------------------------------------------------------------------------
// Worked example, printed in full for manual eyeballing (5 players, 3 byes)
// ---------------------------------------------------------------------------
section('Worked example: 5 players -> bracketSize 8, 3 byes to top seeds')

const worked = buildBracket(assignSeeds(makeParticipants(5), 'RATING'), { gamesPerRound: 2, idPrefix: 'demo' })
console.log(`  bracketSize=${worked.bracketSize}, byeCount=${worked.byeCount}`)
for (const round of worked.rounds) {
  console.log(`  ${round.name} (round ${round.roundNumber}):`)
  for (const match of round.matches) {
    const p1 = match.participant1 ? `#${match.participant1.seed} ${match.participant1.name}` : 'TBD'
    const p2 = match.participant2 ? `#${match.participant2.seed} ${match.participant2.name}` : 'TBD'
    console.log(`    ${match.id}: ${p1} vs ${p2}${match.result === 'BYE' ? ' (BYE)' : ''} -> next: ${match.nextMatchId ?? '(none)'}`)
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${'-'.repeat(60)}`)
console.log(`${checks - failures}/${checks} checks passed`)
if (failures > 0) {
  console.error(`${failures} check(s) FAILED`)
  process.exit(1)
} else {
  console.log('All checks passed.')
}
