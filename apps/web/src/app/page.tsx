import Link from 'next/link'

const flowSteps = [
  {
    title: 'Upload your profile',
    description: 'Paste resume text and optionally add LinkedIn. We parse key skills and experience.',
  },
  {
    title: 'Get matched jobs',
    description: 'See relevant openings ranked by profile fit, with clear reason chips.',
  },
  {
    title: 'Tailor in one click',
    description: 'Generate a job-specific resume draft you can copy and use instantly.',
  },
]

export default function HomePage() {
  return (
    <main className='mx-auto max-w-6xl px-4 py-14'>
      <section className='rounded-3xl border border-slate-700/70 bg-slate-900/70 p-8 md:p-12'>
        <p className='inline-flex rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100'>
          Career Accelerator
        </p>
        <h1 className='mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl'>
          Share your profile once. Discover relevant jobs. Tailor your resume per role.
        </h1>
        <p className='mt-4 max-w-2xl text-base text-slate-300'>
          Turn your experience into explainable job matches, then create an evidence-based resume draft for the role you want.
        </p>

        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            href='/onboarding'
            className='rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500'
          >
            Get matched jobs
          </Link>
          <Link
            href='/recommendations?userId=demo-user-1'
            className='rounded-xl border border-slate-600 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800/70'
          >
            View demo recommendations
          </Link>
        </div>
      </section>

      <section className='mt-10 grid gap-4 md:grid-cols-3'>
        {flowSteps.map((step, index) => (
          <article key={step.title} className='rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5'>
            <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Step {index + 1}</p>
            <h2 className='mt-2 text-xl font-semibold text-slate-50'>{step.title}</h2>
            <p className='mt-2 text-sm text-slate-300'>{step.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}