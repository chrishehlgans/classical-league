'use client'

/**
 * One-directional (left-to-right) elimination bracket, custom-built.
 *
 * Chunk 1's compatibility spike (KO_TOURNAMENT_PLAN.md, Chunk 1 / Step 0)
 * tried `react-brackets` and `@g-loot/react-tournament-brackets`: both only
 * install against React 19 with `--legacy-peer-deps` (peer ranges of
 * ^17 / ^18), and both render their match card wrapper via styled-components
 * with hardcoded colours (e.g. react-brackets' SeedItem ships a fixed
 * `background-color:#1a1d2e; color:#fff`) that fight Tailwind dark mode
 * instead of deferring to it. Gate 3 ("Tailwind 4 dark mode... library must
 * not fight it") failed for both, so per the plan this custom renderer is
 * the documented fallback rather than a library wrapper.
 *
 * Connector lines are computed at runtime from the measured position of each
 * match card (rather than pure-CSS spacing math), so correctness doesn't
 * depend on exact column spacing.
 */

import { useLayoutEffect, useRef, useState, useCallback } from 'react'
import type { KnockoutMatch, KnockoutRound } from '@/lib/ko-tournament-types'
import { BracketMatch } from './bracket-match'

interface BracketTreeProps {
  rounds: KnockoutRound[]
  /** Rendered below the Final, in the same column, when the tournament has one enabled. */
  thirdPlaceMatch?: KnockoutMatch | null
}

interface Connector {
  id: string
  d: string
}

export function BracketTree({ rounds, thirdPlaceMatch = null }: BracketTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const matchRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 })

  const registerMatchRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      matchRefs.current.set(id, el)
    } else {
      matchRefs.current.delete(id)
    }
  }, [])

  const recomputeConnectors = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const nextConnectors: Connector[] = []

    for (const round of rounds) {
      for (const match of round.matches) {
        if (!match.nextMatchId) continue
        const fromEl = matchRefs.current.get(match.id)
        const toEl = matchRefs.current.get(match.nextMatchId)
        if (!fromEl || !toEl) continue

        const fromRect = fromEl.getBoundingClientRect()
        const toRect = toEl.getBoundingClientRect()

        const startX = fromRect.right - containerRect.left
        const startY = fromRect.top + fromRect.height / 2 - containerRect.top
        const endX = toRect.left - containerRect.left
        const endY = toRect.top + toRect.height / 2 - containerRect.top
        const midX = (startX + endX) / 2

        nextConnectors.push({
          id: `${match.id}->${match.nextMatchId}`,
          d: `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`,
        })
      }
    }

    setConnectors(nextConnectors)
    setSvgSize({ width: container.scrollWidth, height: container.scrollHeight })
  }, [rounds])

  useLayoutEffect(() => {
    recomputeConnectors()

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => recomputeConnectors())
    observer.observe(container)
    window.addEventListener('resize', recomputeConnectors)

    // Fonts loading after first paint can shift layout slightly; re-measure once settled.
    const timeout = setTimeout(recomputeConnectors, 150)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', recomputeConnectors)
      clearTimeout(timeout)
    }
  }, [recomputeConnectors])

  if (rounds.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-gray-500 dark:text-gray-400">Bracket not generated yet</div>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          It will appear here once registration closes and seeding is complete.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div ref={containerRef} className="relative inline-flex items-center gap-16 px-2 py-6 min-w-full">
        <svg
          className="absolute inset-0 pointer-events-none text-gray-300 dark:text-gray-600"
          width={svgSize.width}
          height={svgSize.height}
          aria-hidden="true"
        >
          {connectors.map((connector) => (
            <path key={connector.id} d={connector.d} fill="none" stroke="currentColor" strokeWidth={2} />
          ))}
        </svg>

        {rounds.map((round, roundIndex) => {
          const isFinalRound = roundIndex === rounds.length - 1
          return (
            <div key={round.id} className="flex flex-col items-center shrink-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                {round.name}
              </div>
              <div className="flex flex-col" style={{ gap: `${24 * Math.pow(2, roundIndex)}px` }}>
                {round.matches.map((match) => (
                  <div key={match.id} ref={(el) => registerMatchRef(match.id, el)}>
                    <BracketMatch match={match} label={isFinalRound ? '🏆 Final' : undefined} />
                  </div>
                ))}
              </div>
              {isFinalRound && thirdPlaceMatch && (
                <div className="mt-10">
                  <BracketMatch match={thirdPlaceMatch} label="🥉 Third-Place Match" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
