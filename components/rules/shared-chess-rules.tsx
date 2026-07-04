// Identical across both the Classical League and KO Tournament rules tabs —
// FIDE chess rules, conduct, and the closing agreement don't change by format.
export function SharedChessRules() {
  return (
    <>
      {/* Chess Rules */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-3 text-2xl">🎯</span> Basic Chess Rules (FIDE Standard)
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-2">Touch-Move Rule ✋</p>
            <ul className="space-y-2 text-sm list-disc ml-6">
              <li>If you touch a piece intending to move it, you must move that piece (if it has a legal move)</li>
              <li>If you touch an opponent&apos;s piece intending to capture it, you must capture it (if it&apos;s a legal move)</li>
              <li>Want to adjust a piece? Say <strong>&quot;j&apos;adoube&quot;</strong> (I adjust) before touching it</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-2">Illegal Moves 🚫</p>
            <ul className="space-y-2 text-sm list-disc ml-6">
              <li>If you make an illegal move and your opponent notices, you must take it back</li>
              <li>Make a legal move with the same piece if possible</li>
              <li>If that&apos;s not possible, make any legal move</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Check & Checkmate ♔</p>
              <ul className="space-y-2 text-sm list-disc ml-6">
                <li>You must get out of check on your next move</li>
                <li>If your king is checkmated, you lose (obviously!) 😄</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Clock Handling ⏰</p>
              <ul className="space-y-2 text-sm list-disc ml-6">
                <li>Press your clock with the same hand you use to move</li>
                <li>If your time runs out, you lose (if opponent has mating material)</li>
              </ul>
            </div>
          </div>

          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-2">Draw Conditions 🤝</p>
            <ul className="space-y-2 text-sm list-disc ml-6">
              <li><strong>Stalemate:</strong> No legal moves but king isn&apos;t in check</li>
              <li><strong>Threefold repetition:</strong> Same position occurs three times</li>
              <li><strong>50-move rule:</strong> 50 moves without a pawn move or capture</li>
              <li><strong>Mutual agreement:</strong> Both players agree to a draw</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Conduct and Fair Play */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-3 text-2xl">🤝</span> Conduct & Fair Play
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <p className="font-semibold text-purple-800 dark:text-purple-200 mb-3">🌟 Sportsmanship</p>
            <div className="text-purple-700 dark:text-purple-300 space-y-2">
              <p>We&apos;re here to have fun and improve our chess! Please conduct yourself with respect and fairness.</p>
              <p>Remember: we&apos;re all friends here, whether you win, lose, or draw! 😊</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-2">🔍 Disputes</p>
            <p>Got a problem or disagreement? No worries! Report any issues to our tournament organizers, whose decision will be final. We&apos;re here to help resolve things fairly and keep the tournament fun for everyone.</p>
          </div>
        </div>
      </section>

      {/* Agreement */}
      <section>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mb-3">
            🎉 Let&apos;s Have a Great Tournament!
          </h3>
          <p className="text-indigo-700 dark:text-indigo-300">
            By participating in this tournament, all players agree to abide by these rules and the decisions of our tournament organizers.
            Most importantly: <strong>let&apos;s enjoy a fair, competitive, and friendly tournament!</strong>
          </p>
          <p className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 italic">
            Questions? Don&apos;t hesitate to ask - we&apos;re all here to help each other improve and have fun! ♟️✨
          </p>
        </div>
      </section>
    </>
  )
}
