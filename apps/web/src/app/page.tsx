import Link from "next/link";

import { HeroSearchBar } from "@/components/HeroSearchBar";
import { TrustStrip } from "@/components/TrustStrip";

const flowSteps = [
  {
    title: "Set up your profile",
    description:
      "Paste your resume and LinkedIn once. We extract role intent, skills, and experience signals.",
  },
  {
    title: "See role matches instantly",
    description:
      "Explore ranked opportunities with transparent match reasons, salary context, and role fit cues.",
  },
  {
    title: "Tailor and apply faster",
    description:
      "Generate job-specific resume bullets and keyword coverage so your applications are more relevant.",
  },
];

const featuredRoles = [
  {
    title: "Senior Frontend Engineer",
    company: "NovaPay",
    location: "Remote • India",
    salary: "₹38L - ₹55L",
    match: "93% match",
  },
  {
    title: "Product Designer, Growth",
    company: "Sketchline",
    location: "Hybrid • Bengaluru",
    salary: "₹28L - ₹42L",
    match: "89% match",
  },
  {
    title: "Backend Engineer (Node + AI)",
    company: "NeuronStack",
    location: "Remote • Global",
    salary: "$95k - $140k",
    match: "91% match",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <section className="panel p-8 md:p-12">
        <p className="eyebrow">Career Accelerator</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-50 md:text-6xl">
          Find roles that actually fit. Tailor your resume in minutes.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-300 md:text-lg">
          A modern workflow for serious job seekers: profile ingestion,
          transparent matching, and one-click role-specific resume tailoring.
        </p>

        <HeroSearchBar />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/onboarding"
            className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Get matched jobs
          </Link>
          <Link
            href="/recommendations"
            className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800/70"
          >
            View demo recommendations
          </Link>
        </div>

        <TrustStrip />
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {flowSteps.map((step, index) => (
          <article key={step.title} className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">
              Step {index + 1}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-50">
              {step.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">
              Featured opportunities
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50 md:text-3xl">
              High-quality roles picked for relevance
            </h2>
          </div>
          <Link
            href="/recommendations"
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-base-2/80"
          >
            Browse all
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredRoles.map((role) => (
            <article key={role.title} className="card">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Verified role
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-50">
                {role.title}
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                {role.company} • {role.location}
              </p>
              <p className="mt-3 text-sm text-slate-200">{role.salary}</p>
              <span className="mt-4 inline-flex rounded-full border border-success/40 bg-success/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                {role.match}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-brand-400/30 bg-gradient-to-r from-brand-600/20 via-brand-500/10 to-info/10 p-8 md:p-10">
        <h2 className="text-2xl font-semibold text-slate-50 md:text-3xl">
          Ready to stop endless scrolling?
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
          Build your profile once, focus only on high-fit opportunities, and
          generate tailored resume content for each application.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          Start now
        </Link>
      </section>
    </main>
  );
}
