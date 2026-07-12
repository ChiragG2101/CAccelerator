import { RecommendationDetailClient } from '@/components/RecommendationDetailClient'
import { StateError } from '@/components/StateError'
import { getJobById } from '@/lib/api'

interface RecommendationDetailPageProps {
  params: {
    jobId: string
  }
  searchParams?: {
    userId?: string
  }
}

export default async function RecommendationDetailPage({ params, searchParams }: RecommendationDetailPageProps) {
  const userId = searchParams?.userId || 'demo-user-1'

  try {
    const job = await getJobById(params.jobId)
    return <RecommendationDetailClient userId={userId} job={job} />
  } catch (error) {
    return (
      <main className='mx-auto max-w-4xl px-4 py-12'>
        <StateError message={error instanceof Error ? error.message : 'Unable to load job detail.'} />
      </main>
    )
  }
}