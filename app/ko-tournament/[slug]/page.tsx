'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getKoTournamentBySlug } from '@/lib/ko-tournament-fixtures'
import { BracketTree } from '@/components/ko-tournament/bracket-tree'

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  REGISTRATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  REGISTRATION: 'Registration Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}

export default function KoTournamentBracketPage() {
  const params = useParams()
  const slug = params.slug as string
  // HARDCODED DATA — Chunk 1 MVP. Wired to a live API route in Chunk 6.
  const tournament = getKoTournamentBySlug(slug)

  if (!tournament) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tournament not found</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          This KO tournament doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Link href="/ko-tournament" className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
          ← Back to KO Tournaments
        </Link>
      </div>
    )
  }

  const formattedDate = tournament.startDate
    ? new Date(tournament.startDate).toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        <div>
          <Link href="/ko-tournament" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-2 inline-block">
            ← Back to KO Tournaments
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {tournament.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[tournament.status]}`}>
                  {statusLabels[tournament.status]}
                </span>
                <span>{tournament.participants.length} players</span>
                <span>·</span>
                <span>Best of {tournament.gamesPerRound} per match</span>
                {tournament.timeControl && (
                  <>
                    <span>·</span>
                    <span>{tournament.timeControl}</span>
                  </>
                )}
                {formattedDate && (
                  <>
                    <span>·</span>
                    <span>{formattedDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <BracketTree rounds={tournament.rounds} thirdPlaceMatch={tournament.thirdPlaceMatchData} />
      </div>
    </div>
  )
}
