import Link from 'next/link'

const navLinks = [
  { label: 'Find Jobs', href: '/recommendations?userId=demo-user-1' },
  { label: 'How it works', href: '/' },
  { label: 'For Employers', href: '/' },
]

export function NavBar() {
  return (
    <header className='sticky top-0 z-50 border-b border-slate-700/50 bg-base-0/85 backdrop-blur-xl'>
      <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4'>
        <Link href='/' className='text-sm font-semibold tracking-wide text-slate-100'>
          Roles Platform
        </Link>

        <nav className='hidden items-center gap-6 md:flex'>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className='text-sm text-slate-300 transition hover:text-white'>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='rounded-xl border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-base-2/80'
          >
            Sign in
          </button>
          <Link
            href='/onboarding'
            className='rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-500'
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
