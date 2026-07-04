'use client'

import Link from 'next/link'

type RulesTab = 'league' | 'ko'

interface RulesTabsProps {
  activeTab: RulesTab
}

const tabs: { id: RulesTab; label: string; href: string }[] = [
  { id: 'league', label: 'Classical League', href: '/rules' },
  { id: 'ko', label: 'KO Tournament', href: '/rules?format=ko' },
]

export function RulesTabs({ activeTab }: RulesTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 gap-1" role="tablist">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
