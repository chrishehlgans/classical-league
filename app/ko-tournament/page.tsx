import { koTournamentSummaries } from '@/lib/ko-tournament-fixtures'
import { TournamentCard } from '@/components/ko-tournament/tournament-card'

// HARDCODED DATA — Chunk 1 MVP. Replaced by a live DB-backed fetch in Chunk 6
// (see app/api/ko-tournament/route.ts in KO_TOURNAMENT_PLAN.md).
const statusOrder = { IN_PROGRESS: 0, REGISTRATION: 1, DRAFT: 2, COMPLETED: 3 } as const

export default function KoTournamentOverviewPage() {
  const tournaments = [...koTournamentSummaries].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            🏆 KO Tournaments
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Knockout-format side events — single elimination, best-of-N mini-matches
          </p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 mb-2">No KO tournaments yet</div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              New instances will appear here once an admin creates one
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">About KO Tournaments</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• Each match is a mini-match of multiple games; the winner is decided on aggregate score</p>
                <p>• Results are entered by admins — this view is read-only</p>
                <p>• Click a tournament to see its full bracket</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
