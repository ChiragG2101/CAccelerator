import type { Profile } from '@/lib/types'
import { ProfileCard } from '@/components/ProfileCard'

async function fetchProfiles() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  try {
    const response = await fetch(`${base}/profiles?isPublic=true`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return { profiles: [] as Profile[], error: `API error: ${response.status} ${response.statusText}` }
    }

    const data = (await response.json()) as Profile[]
    return { profiles: data, error: null }
  } catch (error) {
    return {
      profiles: [] as Profile[],
      error: error instanceof Error ? error.message : 'Failed to reach API',
    }
  }
}

export default async function HomePage() {
  const { profiles, error } = await fetchProfiles()

  return (
    <main className='mx-auto max-w-6xl px-4 py-12'>
      <header className='mb-10'>
        <h1 className='text-4xl font-bold tracking-tight'>Role Profiles Directory</h1>
        <p className='mt-3 max-w-2xl text-slate-300'>
          Each role can define a personalized profile style and content so it stands out.
        </p>
      </header>

      <section className='grid gap-5 md:grid-cols-2'>
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </section>

      {error ? (
        <p className='mt-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100'>
          Backend unavailable: {error}
        </p>
      ) : null}

      {!error && profiles.length === 0 ? (
        <p className='mt-8 text-slate-400'>No public profiles yet. Seed or create them from the API.</p>
      ) : null}
    </main>
  )
}
