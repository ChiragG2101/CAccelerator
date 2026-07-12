type Role = 'ADMIN' | 'CREATOR' | 'EMPLOYER' | 'CLIENT' | 'STUDENT'

const roleStyles: Record<Role, string> = {
  ADMIN: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
  CREATOR: 'bg-violet-500/20 text-violet-200 border-violet-400/40',
  EMPLOYER: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
  CLIENT: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
  STUDENT: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
}

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${roleStyles[role]}`}>
      {role}
    </span>
  )
}
