import { auth } from '@clerk/nextjs/server'

import { RecommendationsClient } from '@/components/RecommendationsClient'
import { StateError } from '@/components/StateError'
import { getRecommendations } from '@/lib/api'

export default async function RecommendationsPage() {
  const { userId } = auth()

  if (!userId) {
    return (
      <main className='mx-auto max-w-4xl px-4 py-12'>
        <StateError message='You must be signed in to view recommendations.' />
      </main>
    )
  }

  try {
    const data = await getRecommendations(userId)
    return <RecommendationsClient recommendations={data.recommendations} />
  } catch (error) {
    return (
      <main className='mx-auto max-w-4xl px-4 py-12'>
        <StateError
          message={`Unable to load recommendations for ${userId}. ${error instanceof Error ? error.message : ''}`}
        />
      </main>
    )
  }
}