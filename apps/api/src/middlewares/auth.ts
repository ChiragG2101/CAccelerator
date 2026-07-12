import { createRequire } from 'node:module'
import type { RequestHandler } from 'express'

const require = createRequire(import.meta.url)
const clerk = () => require('@clerk/express') as { getAuth(req: unknown): { userId?: string; sessionClaims?: unknown } }

export interface AuthIdentity { clerkUserId: string; email?: string; displayName?: string }

declare global {
  namespace Express { interface Request { requestId: string; authIdentity?: AuthIdentity } }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const auth = clerk().getAuth(req)
  if (!auth.userId) return next(Object.assign(new Error('Authentication required'), { status: 401, code: 'UNAUTHENTICATED' }))
  const claims = auth.sessionClaims as Record<string, unknown> | undefined
  const provider = claims?.['oauth_provider'] ?? claims?.['provider']
  if (provider && !String(provider).toLowerCase().includes('google')) return next(Object.assign(new Error('Google sign-in is required'), { status: 403, code: 'GOOGLE_IDENTITY_REQUIRED' }))
  const email = typeof claims?.['email'] === 'string' ? claims.email : undefined
  const displayName = typeof claims?.['name'] === 'string' ? claims.name : undefined
  req.authIdentity = { clerkUserId: auth.userId, email, displayName }
  next()
}

export const requestId: RequestHandler = (req, res, next) => {
  req.requestId = String(req.header('x-request-id') ?? crypto.randomUUID())
  res.setHeader('x-request-id', req.requestId)
  next()
}
