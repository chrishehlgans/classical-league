import Link from 'next/link'
import { SharedChessRules } from './shared-chess-rules'

// ⚠️ Placeholder copy — KO tournament rules haven't been confirmed by the
// organiser yet (see KO_TOURNAMENT_PLAN.md, Chunk 1.1 "Not certain about").
// Mirrors the League tab's section structure with knockout-specific details.
export function KnockoutRules() {
  return (
    <>
      {/* Quick Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
          <span className="mr-2">⚡</span> Quick Overview (TL;DR)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300 mb-4">
          <div className="space-y-2">
            <p><strong>🏆 Format:</strong> Single-elimination bracket</p>
            <p><strong>🎮 Match:</strong> Best of N games per round (default 2)</p>
            <p><strong>🥇 Winner:</strong> Highest aggregate score across the match</p>
            <p><strong>📊 Seeding:</strong> Top seeds may get a Round-1 bye</p>
          </div>
          <div className="space-y-2">
            <p><strong>🏅 Scoring:</strong> Win=1pt, Draw=0.5pt, Loss=0pt (per game)</p>
            <p><strong>🏠 Location:</strong> Club or agreed location, same as the League</p>
            <p><strong>📝 Results:</strong> Entered by tournament organisers only</p>
            <p><strong>🔁 Ties:</strong> Organiser picks the advancer</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/ko-tournament"
            className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600 dark:hover:bg-blue-900/50 transition-colors"
          >
            🏆 View KO Tournaments
          </Link>
        </div>
        <p className="mt-4 text-xs text-blue-600 dark:text-blue-400 italic">
          📌 Draft rules — subject to change before the first KO tournament kicks off.
        </p>
      </div>

      {/* Main Rules Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-8 space-y-8">
          {/* Tournament Format */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-3 text-2xl">🏆</span> Tournament Format
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Single-Elimination Knockout</p>
                <p>Win your match and advance; lose and you&apos;re out. One bracket, one champion!</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Match Details</p>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Bracket:</strong> Single elimination, seeded going in</li>
                    <li><strong>Games per match:</strong> N games (default 2 — one with each colour)</li>
                    <li><strong>Byes:</strong> Top seeds may skip Round 1 if the field isn&apos;t a full bracket</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Scoring System</p>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Win:</strong> 1 point 🥇</li>
                    <li><strong>Draw:</strong> 0.5 points 🤝</li>
                    <li><strong>Loss:</strong> 0 points</li>
                    <li><strong>Match winner:</strong> Higher aggregate score across all games</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-3 text-2xl">📅</span> Schedule & Timing
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Bracket Progression</p>
                    <p>Round of N → … → Semifinal → Final</p>
                    <p className="text-xs text-gray-500">Advance or you&apos;re out</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Round Deadline</p>
                    <p>Announced per round by the organiser</p>
                    <p className="text-xs text-gray-500">No fixed biweekly cadence like the League</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Next Round</p>
                    <p>Pairings confirmed once results are in</p>
                    <p className="text-xs text-gray-500">See the live bracket</p>
                  </div>
                </div>
              </div>
              <p><strong>Game Arrangement:</strong> Same as the League — players contact each other via WhatsApp to schedule their games. 📱</p>
            </div>
          </section>

          {/* Playing the Games */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-3 text-2xl">♟️</span> Playing Your Games
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Where to Play 🏠</p>
                <p>Games can be played at{' '}
                  <a
                    href="https://schachklub-k4.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Schachklub Kreis 4
                  </a>{' '}
                  (Tuesday evenings) or at a location/time that both players agree, same as the League.</p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🖥️ Online Play (When Needed)</p>
                <p className="text-yellow-700 dark:text-yellow-300">If one player can&apos;t meet in person, you may play online on Lichess. This should be the exception rather than the norm.</p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="font-semibold text-orange-800 dark:text-orange-200 mb-2">🌱 Seeding & Byes</p>
                <p className="text-orange-700 dark:text-orange-300">Unlike the League, KO byes aren&apos;t requested — if the bracket doesn&apos;t fill evenly, the highest seeds automatically skip Round 1 and enter in Round 2. Can&apos;t make your scheduled match at all? Contact the organisers as early as possible.</p>
              </div>
            </div>
          </section>

          {/* Recording Games */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-3 text-2xl">📝</span> Recording Your Game
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Preferred: Paper Scoresheet 📄</p>
                <p>Keep a scoresheet for each game, same as the League — it helps the organiser confirm results if there&apos;s ever a question about the outcome.</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💻 Digital Alternative</p>
                <p className="text-blue-700 dark:text-blue-300">No scoresheet available? Recording the game on Lichess works too.</p>
              </div>
            </div>
          </section>

          {/* Reporting Results */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-3 text-2xl">🏅</span> Reporting Results
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <p className="font-semibold text-green-800 dark:text-green-200 mb-3">📊 Who Reports the Result?</p>
                <div className="text-green-700 dark:text-green-300 space-y-2">
                  <p><strong>Tournament organisers enter every result</strong> — there&apos;s no player-facing submission form for KO matches</p>
                  <p><strong>Tell the organiser</strong> the outcome of each game in your match as soon as it&apos;s played</p>
                  <p><strong>If your match is tied</strong> on aggregate, the organiser will decide the advancer</p>
                  <p className="text-sm mt-3">💡 <em>Full PGN capture and a Lichess broadcast are planned — coming soon!</em></p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/ko-tournament"
                    className="inline-flex items-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-800 bg-white hover:bg-green-50 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600 dark:hover:bg-green-900/50 transition-colors"
                  >
                    🏆 View the Bracket →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <SharedChessRules />
        </div>
      </div>
    </>
  )
}
