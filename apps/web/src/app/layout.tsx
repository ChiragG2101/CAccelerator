import type { Metadata } from 'next'

import { AuthShell } from '@/components/AuthShell'
import './globals.css'

export const metadata: Metadata = {
  title: 'Career Accelerator',
  description: 'Discover relevant jobs and tailor your resume for each role.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-slate-950 text-slate-100'>
        {/* The Clerk dashboard must enable Google only for this MVP instance. */}
        <AuthShell publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>{children}</AuthShell>
      </body>
    </html>
  )
}
