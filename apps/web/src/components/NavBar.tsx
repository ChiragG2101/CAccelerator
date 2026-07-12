'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

const navLinks = [
  { label: 'Find Jobs', href: '/recommendations' },
  { label: 'How it works', href: '/' },
  { label: 'For Employers', href: '/' },
]

function AuthControls() {
  return (
    <>
      <SignedOut>
        <SignInButton mode='modal'>
          <button type='button' className='rounded-xl border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-base-2/80'>Sign in</button>
        </SignInButton>
        <SignUpButton mode='modal'>
          <button type='button' className='rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-500'>Get started</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link href='/onboarding' className='rounded-xl border border-slate-600 px-3 py-2 text-xs font-medium text-slate-100 transition hover:bg-base-2/80'>Get started</Link>
        <UserButton afterSignOutUrl='/' />
      </SignedIn>
    </>
  )
}

export function NavBar({ authEnabled = true }: { authEnabled?: boolean }) {
  return (
    <header className='sticky top-0 z-50 border-b border-slate-700/50 bg-base-0/85 backdrop-blur-xl'>
      <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4'>
        <Link href='/' className='text-sm font-semibold tracking-wide text-slate-100'>
          Roles Platform
        </Link>

        <nav className='hidden items-center gap-6 md:flex'>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className='text-sm text-slate-300 transition hover:text-white'>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2'>
          {authEnabled ? (
            <AuthControls />
          ) : (
            <Link href='/onboarding' className='rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-500'>
              Get started
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
