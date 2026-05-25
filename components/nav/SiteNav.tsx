'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Anchor, User, LogOut, LayoutDashboard, Ship } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function SiteNav() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const isTransparent = pathname === '/'

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isTransparent
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/60'
          : 'bg-white border-b border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-[#0f2547]">
            <Anchor className="w-5 h-5 text-[#06b6d4]" />
            <span className="text-lg">BoatAway</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/search" className="hover:text-[#0f2547] transition-colors">Explore</Link>
            <Link href="/how-it-works" className="hover:text-[#0f2547] transition-colors">How it works</Link>
            <Link href="/become-a-host" className="hover:text-[#0f2547] transition-colors">Become a host</Link>
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-sm font-medium text-slate-700"
                >
                  <Menu className="w-4 h-4" />
                  <div className="w-7 h-7 rounded-full bg-[#06b6d4] flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> My trips
                    </Link>
                    <Link href="/host" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setDropdownOpen(false)}>
                      <Ship className="w-4 h-4" /> Host dashboard
                    </Link>
                    <Link href="/dashboard/messages" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setDropdownOpen(false)}>
                      <User className="w-4 h-4" /> Messages
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button onClick={signOut} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-[#0f2547] transition-colors">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-[#0f2547] text-white text-sm font-medium rounded-full hover:bg-[#1e3a6e] transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-3">
          <Link href="/search" className="block text-sm font-medium text-slate-700 py-2" onClick={() => setOpen(false)}>Explore</Link>
          <Link href="/how-it-works" className="block text-sm font-medium text-slate-700 py-2" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="/become-a-host" className="block text-sm font-medium text-slate-700 py-2" onClick={() => setOpen(false)}>Become a host</Link>
          <div className="pt-2 border-t border-slate-100 flex gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="flex-1 text-center py-2 text-sm font-medium border border-slate-200 rounded-full" onClick={() => setOpen(false)}>Dashboard</Link>
                <button onClick={signOut} className="flex-1 py-2 text-sm font-medium bg-[#0f2547] text-white rounded-full">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex-1 text-center py-2 text-sm font-medium border border-slate-200 rounded-full" onClick={() => setOpen(false)}>Log in</Link>
                <Link href="/signup" className="flex-1 text-center py-2 text-sm font-medium bg-[#0f2547] text-white rounded-full" onClick={() => setOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
