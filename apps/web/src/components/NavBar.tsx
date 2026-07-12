'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

const navLinks = [
  { label: 'Find Jobs', href: '/recommendations' },
  { label: 'How it works', href: '/' },
  { label: 'For Employers', href: '/' },
]

export function NavBar() {
  return (
    <header className='sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl'>
      <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4'>
        <Link href='/' className='text-sm font-semibold tracking-wide text-slate-900'>
          Roles Platform
        </Link>

        <nav className='hidden items-center gap-6 md:flex'>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className='text-sm text-slate-600 transition hover:text-slate-900'>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2'>
          <SignedOut>
            <SignInButton mode='modal'>
              <button
                type='button'
                className='rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 transition hover:bg-slate-100'
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode='modal'>
              <button
                type='button'
                className='rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-500'
              >
                Get started
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href='/onboarding'
              className='rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 transition hover:bg-slate-100'
            >
              Get started
            </Link>
            <UserButton afterSignOutUrl='/' />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
