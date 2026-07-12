import { RecommendationsClient } from '@/components/RecommendationsClient'
import { StateError } from '@/components/StateError'
import { getRecommendations } from '@/lib/api'

interface RecommendationsPageProps {
  searchParams?: {
    userId?: string
  }
}

export default async function RecommendationsPage({ searchParams }: RecommendationsPageProps) {
  const userId = searchParams?.userId || 'demo-user-1'

  try {
    const data = await getRecommendations(userId)
    return <RecommendationsClient userId={userId} recommendations={data.recommendations} />
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