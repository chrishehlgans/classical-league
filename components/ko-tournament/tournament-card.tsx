import Link from 'next/link'
import type { KnockoutTournamentSummary } from '@/lib/ko-tournament-types'

const statusStyles: Record<KnockoutTournamentSummary['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  REGISTRATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const statusLabels: Record<KnockoutTournamentSummary['status'], string> = {
  DRAFT: 'Draft',
  REGISTRATION: 'Registration Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}

function formatDate(dateString: string | null): string | null {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('de-CH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function TournamentCard({ tournament }: { tournament: KnockoutTournamentSummary }) {
  const formattedDate = formatDate(tournament.startDate)

  return (
    <Link href={`/ko-tournament/${tournament.slug}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-all h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tournament.name}</h3>
          <svg
            className="w-6 h-6 shrink-0 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <span
          className={`inline-flex items-center self-start px-2 py-0.5 rounded text-xs font-medium mb-4 ${statusStyles[tournament.status]}`}
        >
          {statusLabels[tournament.status]}
        </span>

        <div className="space-y-2 text-sm mt-auto">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Players</span>
            <span className="font-semibold text-gray-900 dark:text-white">{tournament.participantCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Games / Match</span>
            <span className="font-semibold text-gray-900 dark:text-white">{tournament.gamesPerRound}</span>
          </div>
          {formattedDate && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Start</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formattedDate}</span>
            </div>
          )}
          {tournament.winnerName && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">🏆 Winner</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{tournament.winnerName}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
