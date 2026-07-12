import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/onboarding(.*)',
  '/recommendations(.*)',
  '/jobs(.*)',
  '/tailored(.*)',
])

const clerk = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect()
})

export default function middleware(request: Parameters<typeof clerk>[0], event: Parameters<typeof clerk>[1]) {
  // Keep the seeded demo usable until a Clerk instance is configured locally.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return NextResponse.next()
  }
  return clerk(request, event)
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
