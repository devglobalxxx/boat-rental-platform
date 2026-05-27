'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, LayoutDashboard, Ship } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/search',        label: 'Explore boats' },
  { href: '/how-it-works',  label: 'How it works'  },
  { href: '/blog',          label: 'Blog'           },
  { href: '/become-a-host', label: 'List your boat' },
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(7,16,30,0.97)'
          : 'rgba(7,16,30,0.92)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        borderBottom: '1px solid rgba(201,168,78,0.15)',
        boxShadow: scrolled ? '0 8px 28px rgba(0,0,0,0.45)' : 'none',
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Logo size={38} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative text-sm font-medium transition-colors group/link"
                style={{ color: pathname === l.href ? '#c9a84e' : 'rgba(244,244,242,0.65)' }}
              >
                {l.label}
                <span
                  className="absolute -bottom-0.5 left-0 h-px w-0 group-hover/link:w-full transition-all duration-200"
                  style={{ background: '#c9a84e' }}
                />
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-sm font-medium"
                  style={{
                    border: '1px solid rgba(201,168,78,0.25)',
                    color: '#f4f4f2',
                    background: 'transparent',
                  }}
                >
                  <Menu className="w-4 h-4" />
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#c9a84e', color: '#07101e' }}
                  >
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl py-1 z-50"
                    style={{
                      background: '#0c1828',
                      border: '1px solid rgba(201,168,78,0.20)',
                      boxShadow: '0 18px 50px rgba(0,0,0,0.58)',
                    }}
                  >
                    {[
                      { href: '/dashboard', icon: LayoutDashboard, label: 'My trips' },
                      { href: '/host', icon: Ship, label: 'Host dashboard' },
                      { href: '/dashboard/messages', icon: User, label: 'Messages' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:text-[#c9a84e]"
                        style={{ color: 'rgba(244,244,242,0.75)' }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <item.icon className="w-4 h-4" /> {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(201,168,78,0.12)', margin: '4px 0' }} />
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:text-[#c9a84e]"
                      style={{ color: 'rgba(244,244,242,0.75)' }}
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-[#c9a84e]"
                  style={{ color: 'rgba(244,244,242,0.65)' }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap px-8 py-2.5 text-sm font-bold rounded-full transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)',
                    color: '#07101e',
                    boxShadow: '0 2px 14px rgba(201,168,78,0.22)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 22px rgba(201,168,78,0.45)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 14px rgba(201,168,78,0.22)'
                  }}
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'rgba(244,244,242,0.7)' }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            background: 'rgba(7,16,30,0.98)',
            borderTop: '1px solid rgba(201,168,78,0.10)',
          }}
        >
          <div className="container py-5 space-y-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-3 text-sm font-medium border-b transition-colors hover:text-[#c9a84e]"
                style={{ color: 'rgba(244,244,242,0.75)', borderColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 flex gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="flex-1 text-center py-2.5 text-sm font-medium rounded-full border" style={{ border: '1px solid rgba(201,168,78,0.25)', color: '#c9a84e' }} onClick={() => setOpen(false)}>Dashboard</Link>
                  <button onClick={signOut} className="flex-1 py-2.5 text-sm font-semibold rounded-full" style={{ background: '#c9a84e', color: '#07101e' }}>Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium rounded-full border" style={{ border: '1px solid rgba(201,168,78,0.25)', color: 'rgba(244,244,242,0.75)' }} onClick={() => setOpen(false)}>Log in</Link>
                  <Link href="/signup" className="flex-1 text-center py-3 text-sm font-bold rounded-full" style={{ background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)', color: '#07101e' }} onClick={() => setOpen(false)}>Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
