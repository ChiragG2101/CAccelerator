import type { Profile } from '@/lib/types'
import { ProfileCard } from '@/components/ProfileCard'

async function fetchProfiles() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const response = await fetch(`${base}/profiles?isPublic=true`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Could not fetch profiles')
  }

  return (await response.json()) as Profile[]
}

export default async function HomePage() {
  const profiles = await fetchProfiles()

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

      {profiles.length === 0 ? (
        <p className='mt-8 text-slate-400'>No public profiles yet. Seed or create them from the API.</p>
      ) : null}
    </main>
  )
}
