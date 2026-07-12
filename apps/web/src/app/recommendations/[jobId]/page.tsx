import { RecommendationDetailClient } from '@/components/RecommendationDetailClient'
import { StateError } from '@/components/StateError'
import { getJobById } from '@/lib/api'
import { getApiSession } from '@/lib/server-auth'

interface RecommendationDetailPageProps {
  params: {
    jobId: string
  }
  searchParams?: {
    userId?: string
  }
}

export default async function RecommendationDetailPage({ params, searchParams }: RecommendationDetailPageProps) {
  const session = await getApiSession(searchParams?.userId)
  const userId = session.userId

  try {
    const job = await getJobById(params.jobId, session.token)
    return <RecommendationDetailClient userId={userId} job={job} />
  } catch (error) {
    return (
      <main className='mx-auto max-w-4xl px-4 py-12'>
        <StateError message={error instanceof Error ? error.message : 'Unable to load job detail.'} />
      </main>
    )
  }
}