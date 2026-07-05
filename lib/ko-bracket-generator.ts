/**
 * KO Tournament — bracket engine (Chunk 2 of KO_TOURNAMENT_PLAN.md).
 *
 * Pure, deterministic, dependency-free bracket math: seeding order, next-
 * power-of-2 padding, bye assignment to top seeds, round naming, and the
 * `nextMatchId` linked structure that lets a winner advance with a single
 * pointer update. No Prisma, no `fs`, no `'use server'` — this file must stay
 * importable from anywhere (including, eventually, the client) and runnable
 * in a plain Node/tsx script (see scripts/ko-bracket-engine-demo.ts).
 *
 * Output conforms to the shared view types in ko-tournament-types.ts so it
 * can be dropped straight into fixtures or (later) a persistence layer
 * without a translation step.
 */

import type {
  KnockoutParticipant,
  KnockoutMatch,
  KnockoutRound,
  KnockoutGame,
} from './ko-tournament-types'

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

export type SeedingMethod = 'RATING' | 'RANDOM' | 'MANUAL'

export interface UnseededParticipant {
  id: string
  name: string
  /** Required — every participant has a rating captured at registration. */
  rating: number
}

export interface SeededParticipant extends UnseededParticipant {
  /** 1-indexed bracket seed. Seeds 1..N must be a contiguous permutation. */
  seed: number
}

export interface AssignSeedsOptions {
  /** Required (and only used) for method === 'MANUAL'. id -> seed, must cover every participant with unique values 1..N. */
  manualSeeds?: Record<string, number>
  /** Injectable RNG for method === 'RANDOM' so results are reproducible in tests. Defaults to Math.random. */
  random?: () => number
}

/**
 * Assigns 1-indexed seeds to a list of participants.
 * - RATING: highest rating first, ties broken by name for determinism.
 * - RANDOM: Fisher-Yates shuffle using an injectable RNG.
 * - MANUAL: uses `options.manualSeeds`, validated to be a full 1..N permutation.
 */
export function assignSeeds(
  participants: UnseededParticipant[],
  method: SeedingMethod,
  options: AssignSeedsOptions = {}
): SeededParticipant[] {
  if (participants.length === 0) return []

  if (method === 'MANUAL') {
    const manualSeeds = options.manualSeeds
    if (!manualSeeds) throw new Error('assignSeeds: MANUAL method requires options.manualSeeds')
    const seeded = participants.map((participant) => {
      const seed = manualSeeds[participant.id]
      if (seed === undefined) {
        throw new Error(`assignSeeds: no manual seed provided for participant "${participant.id}"`)
      }
      return { ...participant, seed }
    })
    validateSeedPermutation(seeded)
    return seeded.sort((a, b) => a.seed - b.seed)
  }

  if (method === 'RANDOM') {
    const random = options.random ?? Math.random
    const shuffled = [...participants]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.map((participant, index) => ({ ...participant, seed: index + 1 }))
  }

  // RATING (default)
  const sortedByRating = [...participants].sort((a, b) => {
    if (a.rating !== b.rating) return b.rating - a.rating
    return a.name.localeCompare(b.name)
  })
  return sortedByRating.map((participant, index) => ({ ...participant, seed: index + 1 }))
}

function validateSeedPermutation(participants: SeededParticipant[]): void {
  const seeds = participants.map((participant) => participant.seed).sort((a, b) => a - b)
  for (let i = 0; i < seeds.length; i++) {
    if (seeds[i] !== i + 1) {
      throw new Error(
        `Invalid seeding: expected a contiguous permutation of 1..${seeds.length}, got [${seeds.join(', ')}]`
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Bracket size + seed order
// ---------------------------------------------------------------------------

/** Smallest power of 2 >= participantCount. Requires at least 2 participants. */
export function computeBracketSize(participantCount: number): number {
  if (!Number.isInteger(participantCount) || participantCount < 2) {
    throw new Error(`computeBracketSize: participantCount must be an integer >= 2, got ${participantCount}`)
  }
  let size = 1
  while (size < participantCount) size *= 2
  return size
}

/**
 * Standard "fold" seeding order for a single-elimination bracket of the given
 * size, e.g. size 8 -> [1, 8, 4, 5, 2, 7, 3, 6] (matches: 1v8, 4v5, 2v7, 3v6).
 * Consecutive pairs in the returned array are the Round 1 match pairings.
 *
 * This is the seeding order used by real single-elimination tournaments
 * (tennis/NCAA draws, chess knockouts), not a simple odd/even split. For
 * size 8 it puts {1,4,5,8} in the top half and {2,3,6,7} in the bottom half
 * — seed 1 can only meet seed 2 *or* seed 3 in the final (both live in the
 * other half), and can meet at worst seed 4 or 5 in the semifinal. An
 * odd/even split (top = {1,3,5,7}, bottom = {2,4,6,8}) looks tidier but is
 * measurably worse: seed 3 would then share seed 1's half and could meet
 * them as early as the semifinal instead of only in the final.
 */
export function standardSeedOrder(bracketSize: number): number[] {
  if (!Number.isInteger(bracketSize) || bracketSize < 2 || (bracketSize & (bracketSize - 1)) !== 0) {
    throw new Error(`standardSeedOrder: bracketSize must be a power of 2 >= 2, got ${bracketSize}`)
  }
  let order = [1, 2]
  while (order.length < bracketSize) {
    const size = order.length * 2
    const next: number[] = []
    for (const seed of order) {
      next.push(seed, size + 1 - seed)
    }
    order = next
  }
  return order
}

/**
 * Maps every bracket seed slot (1..bracketSize) to the participant occupying
 * it, or null for a "phantom" slot beyond the real participant count — i.e.
 * a bye. Because standardSeedOrder always pairs a low seed against a high
 * seed, byes are guaranteed (see module tests) to land opposite the top
 * `bracketSize - participants.length` seeds, never opposite each other.
 */
export function assignByes(
  participants: SeededParticipant[],
  bracketSize: number
): Map<number, SeededParticipant | null> {
  const bySeed = new Map<number, SeededParticipant | null>()
  for (let seed = 1; seed <= bracketSize; seed++) {
    bySeed.set(seed, participants.find((participant) => participant.seed === seed) ?? null)
  }
  return bySeed
}

// ---------------------------------------------------------------------------
// Round naming
// ---------------------------------------------------------------------------

export function roundName(matchCountInRound: number): string {
  if (matchCountInRound === 1) return 'Final'
  if (matchCountInRound === 2) return 'Semifinal'
  if (matchCountInRound === 4) return 'Quarterfinal'
  return `Round of ${matchCountInRound * 2}`
}

// ---------------------------------------------------------------------------
// Bracket construction
// ---------------------------------------------------------------------------

export interface BuildBracketOptions {
  /** Games per match. 1 or an even number (colour balance). Default 2. */
  gamesPerRound?: number
  /** Whether to generate a (initially TBD) third-place match. Default false. */
  thirdPlaceMatch?: boolean
  /** Prefix for generated ids, so multiple tournaments built in-process don't collide. */
  idPrefix?: string
}

export interface BracketBuildResult {
  bracketSize: number
  byeCount: number
  rounds: KnockoutRound[]
  thirdPlaceMatchData: KnockoutMatch | null
}

function toParticipantView(participant: SeededParticipant | null): KnockoutParticipant | null {
  if (!participant) return null
  return {
    id: participant.id,
    name: participant.name,
    seed: participant.seed,
    rating: participant.rating,
    isEliminated: false,
  }
}

function placeholderGames(matchId: string, gamesPerRound: number): KnockoutGame[] {
  return Array.from({ length: gamesPerRound }, (_, i) => ({
    id: `${matchId}-g${i + 1}`,
    gameNumber: i + 1,
    result: null,
  }))
}

/** The winner of a match if it has already been decided by a bye; otherwise null. */
function resolvedByeWinner(match: KnockoutMatch): KnockoutParticipant | null {
  if (match.result !== 'BYE') return null
  return match.participant1 ?? match.participant2
}

/**
 * Builds the full single-elimination bracket for a seeded participant list:
 * Round 1 pairings (with byes auto-resolved and cascaded forward), every
 * subsequent round linked via nextMatchId/nextMatchSlot, and an optional
 * third-place match. Pure — no I/O, no randomness, fully deterministic for
 * a given input.
 */
export function buildBracket(
  participants: SeededParticipant[],
  options: BuildBracketOptions = {}
): BracketBuildResult {
  const participantCount = participants.length
  if (participantCount < 2) throw new Error('buildBracket: requires at least 2 participants')
  validateSeedPermutation(participants)

  const gamesPerRound = options.gamesPerRound ?? 2
  if (gamesPerRound < 1 || (gamesPerRound > 1 && gamesPerRound % 2 !== 0)) {
    throw new Error(`buildBracket: gamesPerRound must be 1 or an even number, got ${gamesPerRound}`)
  }

  const idPrefix = options.idPrefix ?? 'ko'
  const bracketSize = computeBracketSize(participantCount)
  const byeCount = bracketSize - participantCount
  const seedOrder = standardSeedOrder(bracketSize)
  const seedSlots = assignByes(participants, bracketSize)
  const totalRounds = Math.log2(bracketSize)

  let globalSlot = 0
  const rounds: KnockoutRound[] = []

  // --- Round 1: real pairings from the seed order, byes resolved immediately.
  const firstRoundMatchCount = bracketSize / 2
  let currentMatches: KnockoutMatch[] = []

  for (let m = 0; m < firstRoundMatchCount; m++) {
    const seedA = seedOrder[m * 2]
    const seedB = seedOrder[m * 2 + 1]
    const participantA = toParticipantView(seedSlots.get(seedA) ?? null)
    const participantB = toParticipantView(seedSlots.get(seedB) ?? null)
    const matchId = `${idPrefix}-r1-m${m + 1}`
    const isBye = (participantA === null) !== (participantB === null)
    const winner = isBye ? participantA ?? participantB : null

    currentMatches.push({
      id: matchId,
      matchNumber: m + 1,
      bracketSlot: ++globalSlot,
      participant1: participantA,
      participant2: participantB,
      winnerId: winner?.id ?? null,
      result: isBye ? 'BYE' : null,
      score1: null,
      score2: null,
      decidedByTiebreak: false,
      tiebreakNote: null,
      games: isBye ? [] : placeholderGames(matchId, gamesPerRound),
      isThirdPlace: false,
      nextMatchId: null,
      nextMatchSlot: null,
    })
  }

  rounds.push({
    id: `${idPrefix}-r1`,
    roundNumber: 1,
    name: roundName(firstRoundMatchCount),
    matches: currentMatches,
  })

  // --- Rounds 2..final: pair up the previous round's matches, cascading any
  // already-known bye winners forward, and wire nextMatchId/Slot backwards.
  for (let roundNumber = 2; roundNumber <= totalRounds; roundNumber++) {
    const prevMatches = currentMatches
    const matchCount = prevMatches.length / 2
    const nextMatches: KnockoutMatch[] = []

    for (let m = 0; m < matchCount; m++) {
      const feederA = prevMatches[m * 2]
      const feederB = prevMatches[m * 2 + 1]
      const matchId = `${idPrefix}-r${roundNumber}-m${m + 1}`

      nextMatches.push({
        id: matchId,
        matchNumber: m + 1,
        bracketSlot: ++globalSlot,
        participant1: resolvedByeWinner(feederA),
        participant2: resolvedByeWinner(feederB),
        winnerId: null,
        result: null,
        score1: null,
        score2: null,
        decidedByTiebreak: false,
        tiebreakNote: null,
        games: placeholderGames(matchId, gamesPerRound),
        isThirdPlace: false,
        nextMatchId: null,
        nextMatchSlot: null,
      })

      feederA.nextMatchId = matchId
      feederA.nextMatchSlot = 1
      feederB.nextMatchId = matchId
      feederB.nextMatchSlot = 2
    }

    rounds.push({
      id: `${idPrefix}-r${roundNumber}`,
      roundNumber,
      name: roundName(matchCount),
      matches: nextMatches,
    })
    currentMatches = nextMatches
  }

  // --- Third-place match: drawn from the semifinal round's losers, which
  // aren't knowable until the semifinal is played — always starts TBD.
  let thirdPlaceMatchData: KnockoutMatch | null = null
  if (options.thirdPlaceMatch && totalRounds >= 2) {
    const matchId = `${idPrefix}-3rd`
    thirdPlaceMatchData = {
      id: matchId,
      matchNumber: 1,
      bracketSlot: ++globalSlot,
      participant1: null,
      participant2: null,
      winnerId: null,
      result: null,
      score1: null,
      score2: null,
      decidedByTiebreak: false,
      tiebreakNote: null,
      games: placeholderGames(matchId, gamesPerRound),
      isThirdPlace: true,
      nextMatchId: null,
      nextMatchSlot: null,
    }
  }

  return { bracketSize, byeCount, rounds, thirdPlaceMatchData }
}
