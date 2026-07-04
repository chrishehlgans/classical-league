/**
 * Shared TypeScript types for the KO (Knockout) Tournament feature.
 *
 * These mirror the target Prisma data model documented in KO_TOURNAMENT_PLAN.md
 * so the UI (Chunk 1) and bracket engine (Chunk 2) can share stable shapes
 * before any database models exist (Chunk 3).
 */

export type KnockoutStatus = 'DRAFT' | 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED'

export type KnockoutFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION'

/** Match-level outcome, derived from the aggregate score across a match's games. */
export type KnockoutResult = 'P1_WIN' | 'P2_WIN' | 'BYE'

/** Single-game outcome within a match. */
export type GameOutcome = 'P1_WIN' | 'P2_WIN' | 'DRAW'

export interface KnockoutParticipant {
  id: string
  name: string
  seed: number | null
  rating: number | null
  isEliminated: boolean
}

export interface KnockoutGame {
  id: string
  gameNumber: number
  result: GameOutcome | null
}

export interface KnockoutMatch {
  id: string
  matchNumber: number
  bracketSlot: number
  participant1: KnockoutParticipant | null
  participant2: KnockoutParticipant | null
  winnerId: string | null
  result: KnockoutResult | null
  /** Aggregate score across the match's games (chess points, 0.5 increments). */
  score1: number | null
  score2: number | null
  decidedByTiebreak: boolean
  tiebreakNote: string | null
  games: KnockoutGame[]
  isThirdPlace: boolean
  /** Which match the winner advances into; null for the final. */
  nextMatchId: string | null
  nextMatchSlot: 1 | 2 | null
}

export interface KnockoutRound {
  id: string
  roundNumber: number
  /** e.g. "Round of 16", "Quarterfinal", "Semifinal", "Final" */
  name: string
  matches: KnockoutMatch[]
}

export interface KnockoutTournament {
  id: string
  slug: string
  name: string
  status: KnockoutStatus
  format: KnockoutFormat
  bracketSize: number
  /** Games per match. 1 or an even number so colours stay balanced. */
  gamesPerRound: number
  thirdPlaceMatch: boolean
  /** "Coming soon" — PGN capture + Lichess broadcast; always false in v1. */
  enableGameRecording: boolean
  startDate: string | null
  timeControl: string | null
  participants: KnockoutParticipant[]
  rounds: KnockoutRound[]
  /** The third-place match, when `thirdPlaceMatch` is enabled and it exists. */
  thirdPlaceMatchData: KnockoutMatch | null
}

/** Lightweight shape for the multi-tournament overview grid. */
export interface KnockoutTournamentSummary {
  id: string
  slug: string
  name: string
  status: KnockoutStatus
  gamesPerRound: number
  participantCount: number
  startDate: string | null
  winnerName: string | null
}
