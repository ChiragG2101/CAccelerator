import { auth } from '@clerk/nextjs/server'

export async function getApiSession(demoUserId = 'demo-user-1') {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return { userId: demoUserId, token: null }
  }

  const session = await auth()
  if (!session.userId) return { userId: demoUserId, token: null }
  return { userId: session.userId, token: await session.getToken() }
}
