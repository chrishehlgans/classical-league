import type { KnockoutMatch } from '@/lib/ko-tournament-types'

interface BracketMatchProps {
  match: KnockoutMatch
  label?: string
}

function formatScore(score: number | null): string {
  if (score === null) return '–'
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

function PlayerRow({
  name,
  seed,
  score,
  isWinner,
  isDecided,
}: {
  name: string | null
  seed: number | null
  score: number | null
  isWinner: boolean
  isDecided: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded ${
        isWinner ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {seed !== null && (
          <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums">
            #{seed}
          </span>
        )}
        <span
          className={`truncate text-sm ${
            name ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 italic'
          } ${isWinner ? 'font-semibold' : ''}`}
        >
          {name ?? 'TBD'}
        </span>
      </div>
      {isDecided && (
        <span
          className={`shrink-0 text-sm tabular-nums ${
            isWinner ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatScore(score)}
        </span>
      )}
    </div>
  )
}

export function BracketMatch({ match, label }: BracketMatchProps) {
  const isDecided = match.result !== null
  const p1Winner = isDecided && match.winnerId === match.participant1?.id
  const p2Winner = isDecided && match.winnerId === match.participant2?.id

  return (
    <div className="w-56 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {label && (
        <div className="px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
          {label}
        </div>
      )}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        <PlayerRow
          name={match.participant1?.name ?? null}
          seed={match.participant1?.seed ?? null}
          score={match.score1}
          isWinner={p1Winner}
          isDecided={isDecided}
        />
        <PlayerRow
          name={match.participant2?.name ?? null}
          seed={match.participant2?.seed ?? null}
          score={match.score2}
          isWinner={p2Winner}
          isDecided={isDecided}
        />
      </div>
      {match.decidedByTiebreak && (
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-900/40">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400">
            🎲 Tiebreak
          </span>
        </div>
      )}
    </div>
  )
}
