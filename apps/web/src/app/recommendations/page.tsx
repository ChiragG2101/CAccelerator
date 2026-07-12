import { RecommendationsClient } from '@/components/RecommendationsClient'
import { StateError } from '@/components/StateError'
import { getRecommendations, resolveCandidate } from '@/lib/api'
import { getApiSession } from '@/lib/server-auth'

interface RecommendationsPageProps { searchParams?: { candidateId?: string } }

export default async function RecommendationsPage({ searchParams }: RecommendationsPageProps) {
  const session = await getApiSession()

  try {
    const candidateId = searchParams?.candidateId ?? (await resolveCandidate(session.token)).id
    const data = await getRecommendations(candidateId, session.token)
    return <RecommendationsClient recommendations={data.recommendations} />
  } catch (error) {
    return (
      <main className='mx-auto max-w-4xl px-4 py-12'>
        <StateError message={`Unable to load your recommendations. ${error instanceof Error ? error.message : ''}`} />
      </main>
    )
  }
}