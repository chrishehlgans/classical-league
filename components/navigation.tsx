'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { tournamentConfig } from '@/lib/tournament-config'

// Navigation items that are always visible
const baseNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Stats', href: '/stats' },
  { name: 'Tournament Links', href: '/links' },
]

// Navigation items only visible during active season
const activeSeasonNavigation = [
  { name: 'Register', href: '/players/register' },
  { name: 'Player Directory', href: '/players' },
  { name: 'Request Bye', href: '/byes' },
  { name: 'Submit Result', href: '/submit-result' },
  { name: 'Rules', href: '/rules' },
]

// Build navigation based on season status
const leagueNavigation = tournamentConfig.isSeasonActive
  ? [
      baseNavigation[0], // Home
      activeSeasonNavigation[0], // Register
      activeSeasonNavigation[1], // Player Directory
      activeSeasonNavigation[2], // Request Bye
      activeSeasonNavigation[3], // Submit Result
      baseNavigation[1], // Stats
      activeSeasonNavigation[4], // Rules
      baseNavigation[2], // Tournament Links
    ]
  : baseNavigation

// Navigation items shown while browsing the KO Tournaments section
const koNavigation = [{ name: 'Home', href: '/ko-tournament' }]

// The two "products" the brand dropdown switches between
const brandOptions = [
  { mode: 'league' as const, label: '♛ K4 Classical League', href: '/' },
  { mode: 'ko' as const, label: '🏆 KO Tournaments', href: '/ko-tournament' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [brandMenuOpen, setBrandMenuOpen] = useState(false)
  const brandMenuRef = useRef<HTMLDivElement>(null)

  // Which section is active is derived from the URL, so the brand dropdown
  // is a navigational switch rather than persisted client state.
  const navMode = pathname.startsWith('/ko-tournament') ? 'ko' : 'league'
  const navigation = navMode === 'ko' ? koNavigation : leagueNavigation
  const activeBrand = brandOptions.find((option) => option.mode === navMode)!

  // Close brand dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandMenuRef.current && !brandMenuRef.current.contains(event.target as Node)) {
        setBrandMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setBrandMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <nav className="bg-gray-800 relative z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 relative" ref={brandMenuRef}>
              <button
                type="button"
                onClick={() => setBrandMenuOpen(!brandMenuOpen)}
                className="flex items-center gap-1.5 text-white font-bold text-xl hover:text-gray-300 transition-colors"
                aria-haspopup="true"
                aria-expanded={brandMenuOpen}
              >
                {activeBrand.label}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${brandMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {brandMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                  {brandOptions.map((option) => (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => {
                        setBrandMenuOpen(false)
                        if (option.mode !== navMode) {
                          router.push(option.href)
                        }
                      }}
                      className={classNames(
                        'w-full text-left px-4 py-2 text-sm font-medium transition-colors',
                        option.mode === navMode
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200'
                    )}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle main menu"
            >
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-transform duration-200`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-transform duration-200`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 lg:hidden"
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu slide-out */}
      <div
        className={classNames(
          'fixed top-0 right-0 z-40 h-full w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <span className="text-white font-bold text-lg">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-2 py-3 border-b border-gray-700">
          {brandOptions.map((option) => (
            <Link
              key={option.mode}
              href={option.href}
              className={classNames(
                option.mode === navMode
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-3 text-base font-medium transition-colors duration-200'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {option.label}
            </Link>
          ))}
        </div>
        <div className="px-2 py-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                pathname === item.href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-3 text-base font-medium transition-colors duration-200'
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}