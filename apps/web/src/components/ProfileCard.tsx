import type { Profile } from '../lib/types'
import { RoleBadge } from './RoleBadge'

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <article className='card'>
      <div className='mb-4 flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-semibold'>{profile.name || 'Unnamed user'}</h2>
          <p className='text-sm text-slate-300'>{profile.email}</p>
        </div>
        <RoleBadge role={profile.role} />
      </div>

      <p className='text-slate-200'>{profile.bio || 'No bio yet.'}</p>

      {profile.headline ? <p className='mt-2 text-lg font-medium'>{profile.headline}</p> : null}

      <div className='mt-3 grid gap-2 text-sm text-slate-300'>
        <div>
          <span className='font-semibold text-slate-100'>Stand-out trait:</span>{' '}
          {profile.theme?.accent?.toUpperCase() || 'Custom'}
        </div>
        <div>
          <span className='font-semibold text-slate-100'>Role style:</span>{' '}
          {profile.theme?.style || 'General'}
        </div>
      </div>

      {Array.isArray(profile.customHighlights) && profile.customHighlights.length > 0 && (
        <ul className='mt-4 list-disc pl-5 text-sm'>
          {profile.customHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  )
}
