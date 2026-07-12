import { auth } from '@clerk/nextjs/server'

import { RecommendationDetailClient } from '@/components/RecommendationDetailClient'
import { StateError } from '@/components/StateError'
import { getJobById } from '@/lib/api'

interface RecommendationDetailPageProps {
  params: {
    jobId: string
  }
}

export default async function RecommendationDetailPage({ params }: RecommendationDetailPageProps) {
  const { userId } = auth()

  if (!userId) {
    return (
      <main className='mx-auto max-w-4xl px-4 py-12'>
        <StateError message='You must be signed in to view role details.' />
      </main>
    )
  }

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