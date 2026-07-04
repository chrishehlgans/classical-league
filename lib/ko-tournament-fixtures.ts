import type {
  KnockoutTournament,
  KnockoutTournamentSummary,
  KnockoutParticipant,
  KnockoutMatch,
} from './ko-tournament-types'

/**
 * HARDCODED FIXTURE DATA — Chunk 1 MVP only.
 *
 * There is no database or bracket engine yet (those land in Chunk 2/3 per
 * KO_TOURNAMENT_PLAN.md). Everything below is static sample data so the
 * overview + bracket UI can be built and reviewed before any backend work.
 * `app/ko-tournament/page.tsx` and `app/ko-tournament/[slug]/page.tsx`
 * import directly from here; swap for real data fetching in Chunk 6.
 */

function participant(
  id: string,
  name: string,
  seed: number,
  rating: number,
  isEliminated: boolean
): KnockoutParticipant {
  return { id, name, seed, rating, isEliminated }
}

// ---------------------------------------------------------------------------
// Tournament 1: "K4 Summer Blitz Knockout" — COMPLETED, 8 players, best-of-2
// ---------------------------------------------------------------------------

const summerParticipants: KnockoutParticipant[] = [
  participant('sb-p1', 'Nora Fischer', 1, 2180, false),
  participant('sb-p2', 'Elias Tal', 2, 2105, true),
  participant('sb-p3', 'Mia Petrosian', 3, 2065, true),
  participant('sb-p4', 'Luca Botvinnik', 4, 2020, true),
  participant('sb-p5', 'Sara Capablanca', 5, 1990, true),
  participant('sb-p6', 'Jonas Alekhine', 6, 1955, true),
  participant('sb-p7', 'Lea Kasparov', 7, 1920, true),
  participant('sb-p8', 'Timo Carlsen', 8, 1880, true),
]

const [nora, elias, mia, luca, sara, jonas, lea, timo] = summerParticipants

const summerQf1: KnockoutMatch = {
  id: 'sb-qf1',
  matchNumber: 1,
  bracketSlot: 1,
  participant1: nora,
  participant2: timo,
  winnerId: nora.id,
  result: 'P1_WIN',
  score1: 2,
  score2: 0,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [
    { id: 'sb-qf1-g1', gameNumber: 1, result: 'P1_WIN' },
    { id: 'sb-qf1-g2', gameNumber: 2, result: 'P1_WIN' },
  ],
  isThirdPlace: false,
  nextMatchId: 'sb-sf1',
  nextMatchSlot: 1,
}

const summerQf2: KnockoutMatch = {
  id: 'sb-qf2',
  matchNumber: 2,
  bracketSlot: 2,
  participant1: luca,
  participant2: sara,
  winnerId: sara.id,
  result: 'P2_WIN',
  score1: 0.5,
  score2: 1.5,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [
    { id: 'sb-qf2-g1', gameNumber: 1, result: 'DRAW' },
    { id: 'sb-qf2-g2', gameNumber: 2, result: 'P2_WIN' },
  ],
  isThirdPlace: false,
  nextMatchId: 'sb-sf1',
  nextMatchSlot: 2,
}

const summerQf3: KnockoutMatch = {
  id: 'sb-qf3',
  matchNumber: 3,
  bracketSlot: 3,
  participant1: mia,
  participant2: jonas,
  winnerId: mia.id,
  result: 'P1_WIN',
  score1: 1,
  score2: 1,
  decidedByTiebreak: true,
  tiebreakNote: 'Aggregate tied 1–1; advancer decided by Armageddon.',
  games: [
    { id: 'sb-qf3-g1', gameNumber: 1, result: 'P1_WIN' },
    { id: 'sb-qf3-g2', gameNumber: 2, result: 'P2_WIN' },
  ],
  isThirdPlace: false,
  nextMatchId: 'sb-sf2',
  nextMatchSlot: 1,
}

const summerQf4: KnockoutMatch = {
  id: 'sb-qf4',
  matchNumber: 4,
  bracketSlot: 4,
  participant1: elias,
  participant2: lea,
  winnerId: elias.id,
  result: 'P1_WIN',
  score1: 2,
  score2: 0,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [
    { id: 'sb-qf4-g1', gameNumber: 1, result: 'P1_WIN' },
    { id: 'sb-qf4-g2', gameNumber: 2, result: 'P1_WIN' },
  ],
  isThirdPlace: false,
  nextMatchId: 'sb-sf2',
  nextMatchSlot: 2,
}

const summerSf1: KnockoutMatch = {
  id: 'sb-sf1',
  matchNumber: 1,
  bracketSlot: 1,
  participant1: nora,
  participant2: sara,
  winnerId: nora.id,
  result: 'P1_WIN',
  score1: 1.5,
  score2: 0.5,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [
    { id: 'sb-sf1-g1', gameNumber: 1, result: 'DRAW' },
    { id: 'sb-sf1-g2', gameNumber: 2, result: 'P1_WIN' },
  ],
  isThirdPlace: false,
  nextMatchId: 'sb-final',
  nextMatchSlot: 1,
}

const summerSf2: KnockoutMatch = {
  id: 'sb-sf2',
  matchNumber: 2,
  bracketSlot: 2,
  participant1: mia,
  participant2: elias,
  winnerId: elias.id,
  result: 'P2_WIN',
  score1: 0,
  score2: 2,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [
    { id: 'sb-sf2-g1', gameNumber: 1, result: 'P2_WIN' },
    { id: 'sb-sf2-g2', gameNumber: 2, result: 'P2_WIN' },
  ],
  isThirdPlace: false,
  nextMatchId: 'sb-final',
  nextMatchSlot: 2,
}

const summerFinal: KnockoutMatch = {
  id: 'sb-final',
  matchNumber: 1,
  bracketSlot: 1,
  participant1: nora,
  participant2: elias,
  winnerId: nora.id,
  result: 'P1_WIN',
  score1: 1.5,
  score2: 0.5,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [
    { id: 'sb-final-g1', gameNumber: 1, result: 'P1_WIN' },
    { id: 'sb-final-g2', gameNumber: 2, result: 'DRAW' },
  ],
  isThirdPlace: false,
  nextMatchId: null,
  nextMatchSlot: null,
}

const summerThirdPlace: KnockoutMatch = {
  id: 'sb-3rd',
  matchNumber: 1,
  bracketSlot: 1,
  participant1: sara,
  participant2: mia,
  winnerId: sara.id,
  result: 'P1_WIN',
  score1: 2,
  score2: 0,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [
    { id: 'sb-3rd-g1', gameNumber: 1, result: 'P1_WIN' },
    { id: 'sb-3rd-g2', gameNumber: 2, result: 'P1_WIN' },
  ],
  isThirdPlace: true,
  nextMatchId: null,
  nextMatchSlot: null,
}

const summerBlitzKnockout: KnockoutTournament = {
  id: 'ko-summer-blitz-2026',
  slug: 'summer-blitz-2026',
  name: 'K4 Summer Blitz Knockout',
  status: 'COMPLETED',
  format: 'SINGLE_ELIMINATION',
  bracketSize: 8,
  gamesPerRound: 2,
  thirdPlaceMatch: true,
  enableGameRecording: false,
  startDate: '2026-05-10',
  timeControl: '5+3',
  participants: summerParticipants,
  rounds: [
    { id: 'sb-r1', roundNumber: 1, name: 'Quarterfinal', matches: [summerQf1, summerQf2, summerQf3, summerQf4] },
    { id: 'sb-r2', roundNumber: 2, name: 'Semifinal', matches: [summerSf1, summerSf2] },
    { id: 'sb-r3', roundNumber: 3, name: 'Final', matches: [summerFinal] },
  ],
  thirdPlaceMatchData: summerThirdPlace,
}

// ---------------------------------------------------------------------------
// Tournament 2: "K4 Autumn Rapid Knockout" — IN_PROGRESS, 8 players, single game
// ---------------------------------------------------------------------------

const autumnParticipants: KnockoutParticipant[] = [
  participant('ar-p1', 'Ivo Steinitz', 1, 2140, false),
  participant('ar-p2', 'Anna Morphy', 2, 2090, false),
  participant('ar-p3', 'Kai Euwe', 3, 2050, false),
  participant('ar-p4', 'Zoe Spassky', 4, 2010, true),
  participant('ar-p5', 'Marc Keres', 5, 1985, false),
  participant('ar-p6', 'Priya Anand', 6, 1960, true),
  participant('ar-p7', 'Ben Larsen', 7, 1930, true),
  participant('ar-p8', 'Nina Smyslov', 8, 1895, true),
]

const [ivo, anna, kai, zoe, marc, priya, ben, nina] = autumnParticipants

const autumnQf1: KnockoutMatch = {
  id: 'ar-qf1',
  matchNumber: 1,
  bracketSlot: 1,
  participant1: ivo,
  participant2: nina,
  winnerId: ivo.id,
  result: 'P1_WIN',
  score1: 1,
  score2: 0,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [{ id: 'ar-qf1-g1', gameNumber: 1, result: 'P1_WIN' }],
  isThirdPlace: false,
  nextMatchId: 'ar-sf1',
  nextMatchSlot: 1,
}

const autumnQf2: KnockoutMatch = {
  id: 'ar-qf2',
  matchNumber: 2,
  bracketSlot: 2,
  participant1: zoe,
  participant2: marc,
  winnerId: marc.id,
  result: 'P2_WIN',
  score1: 0,
  score2: 1,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [{ id: 'ar-qf2-g1', gameNumber: 1, result: 'P2_WIN' }],
  isThirdPlace: false,
  nextMatchId: 'ar-sf1',
  nextMatchSlot: 2,
}

const autumnQf3: KnockoutMatch = {
  id: 'ar-qf3',
  matchNumber: 3,
  bracketSlot: 3,
  participant1: kai,
  participant2: priya,
  winnerId: kai.id,
  result: 'P1_WIN',
  score1: 1,
  score2: 0,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [{ id: 'ar-qf3-g1', gameNumber: 1, result: 'P1_WIN' }],
  isThirdPlace: false,
  nextMatchId: 'ar-sf2',
  nextMatchSlot: 1,
}

const autumnQf4: KnockoutMatch = {
  id: 'ar-qf4',
  matchNumber: 4,
  bracketSlot: 4,
  participant1: anna,
  participant2: ben,
  winnerId: anna.id,
  result: 'P1_WIN',
  score1: 1,
  score2: 0,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [{ id: 'ar-qf4-g1', gameNumber: 1, result: 'P1_WIN' }],
  isThirdPlace: false,
  nextMatchId: 'ar-sf2',
  nextMatchSlot: 2,
}

// Semifinal participants are known (winners advanced) but games haven't been
// played yet — this is what an upcoming, unplayed match looks like.
const autumnSf1: KnockoutMatch = {
  id: 'ar-sf1',
  matchNumber: 1,
  bracketSlot: 1,
  participant1: ivo,
  participant2: marc,
  winnerId: null,
  result: null,
  score1: null,
  score2: null,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [{ id: 'ar-sf1-g1', gameNumber: 1, result: null }],
  isThirdPlace: false,
  nextMatchId: 'ar-final',
  nextMatchSlot: 1,
}

const autumnSf2: KnockoutMatch = {
  id: 'ar-sf2',
  matchNumber: 2,
  bracketSlot: 2,
  participant1: kai,
  participant2: anna,
  winnerId: null,
  result: null,
  score1: null,
  score2: null,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [{ id: 'ar-sf2-g1', gameNumber: 1, result: null }],
  isThirdPlace: false,
  nextMatchId: 'ar-final',
  nextMatchSlot: 2,
}

// Final's participants are not known yet — feeder matches undecided.
const autumnFinal: KnockoutMatch = {
  id: 'ar-final',
  matchNumber: 1,
  bracketSlot: 1,
  participant1: null,
  participant2: null,
  winnerId: null,
  result: null,
  score1: null,
  score2: null,
  decidedByTiebreak: false,
  tiebreakNote: null,
  games: [{ id: 'ar-final-g1', gameNumber: 1, result: null }],
  isThirdPlace: false,
  nextMatchId: null,
  nextMatchSlot: null,
}

const autumnRapidKnockout: KnockoutTournament = {
  id: 'ko-autumn-rapid-2026',
  slug: 'autumn-rapid-2026',
  name: 'K4 Autumn Rapid Knockout',
  status: 'IN_PROGRESS',
  format: 'SINGLE_ELIMINATION',
  bracketSize: 8,
  gamesPerRound: 1,
  thirdPlaceMatch: false,
  enableGameRecording: false,
  startDate: '2026-06-20',
  timeControl: '15+10',
  participants: autumnParticipants,
  rounds: [
    { id: 'ar-r1', roundNumber: 1, name: 'Quarterfinal', matches: [autumnQf1, autumnQf2, autumnQf3, autumnQf4] },
    { id: 'ar-r2', roundNumber: 2, name: 'Semifinal', matches: [autumnSf1, autumnSf2] },
    { id: 'ar-r3', roundNumber: 3, name: 'Final', matches: [autumnFinal] },
  ],
  thirdPlaceMatchData: null,
}

// ---------------------------------------------------------------------------
// Tournament 3: "K4 Winter Bullet Cup" — REGISTRATION, bracket not generated yet
// ---------------------------------------------------------------------------

// Seeds aren't assigned until registration closes, so these are seed: null.
const winterParticipants: KnockoutParticipant[] = [
  { id: 'wb-p1', name: 'Otto Rubinstein', seed: null, rating: 2010, isEliminated: false },
  { id: 'wb-p2', name: 'Freya Nimzowitsch', seed: null, rating: 1975, isEliminated: false },
  { id: 'wb-p3', name: 'Dana Réti', seed: null, rating: 1940, isEliminated: false },
  { id: 'wb-p4', name: 'Milo Bronstein', seed: null, rating: 1905, isEliminated: false },
  { id: 'wb-p5', name: 'Vera Chigorin', seed: null, rating: 1870, isEliminated: false },
  { id: 'wb-p6', name: 'Sami Larsen', seed: null, rating: 1830, isEliminated: false },
]

const winterBulletCup: KnockoutTournament = {
  id: 'ko-winter-bullet-2026',
  slug: 'winter-bullet-2026',
  name: 'K4 Winter Bullet Cup',
  status: 'REGISTRATION',
  format: 'SINGLE_ELIMINATION',
  bracketSize: 8,
  gamesPerRound: 4,
  thirdPlaceMatch: false,
  enableGameRecording: false,
  startDate: '2026-08-15',
  timeControl: '1+0',
  participants: winterParticipants,
  // Bracket isn't generated until registration closes (Chunk 2/7) — no rounds yet.
  rounds: [],
  thirdPlaceMatchData: null,
}

export const koTournamentFixtures: KnockoutTournament[] = [
  summerBlitzKnockout,
  autumnRapidKnockout,
  winterBulletCup,
]

function findWinnerName(tournament: KnockoutTournament): string | null {
  const finalRound = tournament.rounds[tournament.rounds.length - 1]
  const finalMatch = finalRound?.matches[0]
  if (!finalMatch?.winnerId) return null
  const winner = tournament.participants.find((p) => p.id === finalMatch.winnerId)
  return winner?.name ?? null
}

export const koTournamentSummaries: KnockoutTournamentSummary[] = koTournamentFixtures.map(
  (tournament) => ({
    id: tournament.id,
    slug: tournament.slug,
    name: tournament.name,
    status: tournament.status,
    gamesPerRound: tournament.gamesPerRound,
    participantCount: tournament.participants.length,
    startDate: tournament.startDate,
    winnerName: findWinnerName(tournament),
  })
)

export function getKoTournamentBySlug(slug: string): KnockoutTournament | undefined {
  return koTournamentFixtures.find((tournament) => tournament.slug === slug)
}
