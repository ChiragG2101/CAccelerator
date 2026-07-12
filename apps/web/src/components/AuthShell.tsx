'use client'

import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { createContext, useContext, type ReactNode } from 'react'

type ApiSession = { userId: string | null; getToken: () => Promise<string | null> }
const demoSession: ApiSession = { userId: null, getToken: async () => null }
const ApiSessionContext = createContext<ApiSession>(demoSession)

export function useApiSession() {
  return useContext(ApiSessionContext)
}

function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { getToken, userId } = useAuth()
  return <ApiSessionContext.Provider value={{ userId: userId ?? null, getToken }}>{children}</ApiSessionContext.Provider>
}

function Header({ authEnabled }: { authEnabled: boolean }) {
  return (
    <header className='border-b border-slate-800 bg-slate-950/90'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-4'>
        <Link href='/' className='font-semibold text-slate-50'>Career Accelerator</Link>
        {authEnabled ? (
          <div className='flex items-center gap-3'>
            <SignedOut>
              <SignInButton mode='modal' forceRedirectUrl='/onboarding'>
                <button className='rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500'>
                  Continue with Google
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href='/recommendations' className='text-sm text-slate-300 hover:text-white'>My matches</Link>
              <UserButton afterSignOutUrl='/' />
            </SignedIn>
          </div>
        ) : (
          <span className='rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-100'>Demo mode · auth not configured</span>
        )}
      </div>
    </header>
  )
}

export function AuthShell({ children, publishableKey }: { children: ReactNode; publishableKey?: string }) {
  if (!publishableKey) {
    return (
      <ApiSessionContext.Provider value={demoSession}>
        <Header authEnabled={false} />
        {children}
      </ApiSessionContext.Provider>
    )
  }

  return (
    <ClerkProvider publishableKey={publishableKey} signInFallbackRedirectUrl='/onboarding' signUpFallbackRedirectUrl='/onboarding'>
      <ClerkSessionBridge>
        <Header authEnabled />
        {children}
      </ClerkSessionBridge>
    </ClerkProvider>
  )
}
