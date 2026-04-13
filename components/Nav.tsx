'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logoutAction } from '@/app/actions'

const NAV_LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/wines', label: 'Wines' },
  { href: '/my-list', label: 'My List' },
  { href: '/events', label: 'Events' },
  { href: '/bugs', label: 'Bugs' },
  { href: '/wines/add', label: '+ Add' },
]

export function Nav({ userName }: { userName: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-wine-dark text-white shadow-md">
      {/* Main bar */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand + subtitle */}
        <div className="flex flex-col">
          <Link
            href="/home"
            className="text-xl font-bold text-gold tracking-wide"
            onClick={() => setMenuOpen(false)}
          >
            Dame Wine
          </Link>
          <span className="text-xs text-white/50 tracking-wide">wine tasting in the age of AI</span>
        </div>

        {/* Desktop nav links — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/20">
            <span className="text-white/60">{userName}</span>
            <form action={logoutAction}>
              <button type="submit" className="text-white/60 hover:text-white transition-colors text-xs">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Hamburger button — only on mobile */}
        <button
          className="sm:hidden p-2 text-white/80 hover:text-white transition-colors text-lg leading-none"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-wine-dark">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-white/60 text-sm">{userName}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-white/60 hover:text-white transition-colors text-xs"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}
