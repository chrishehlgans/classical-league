import { RulesTabs } from '@/components/rules/rules-tabs'
import { LeagueRules } from '@/components/rules/league-rules'
import { KnockoutRules } from '@/components/rules/knockout-rules'

export default async function RulesPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string }>
}) {
  const { format } = await searchParams
  const activeTab = format === 'ko' ? 'ko' : 'league'

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Tournament Rules
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know for a fun and fair chess tournament! 🏆
          </p>
        </div>

        <RulesTabs activeTab={activeTab} />

        {activeTab === 'ko' ? <KnockoutRules /> : <LeagueRules />}
      </div>
    </div>
  )
}
