import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const templates: Array<{ role: Role; name: string; bio: string; headline: string; accent: string; style: string; highlights: string[] }> = [
    {
      role: Role.CREATOR,
      name: 'Ava Creative',
      bio: 'Designs visuals with personality and purpose for modern web products.',
      headline: 'UX Designer & Visual Storyteller',
      accent: 'violet',
      style: 'editorial',
      highlights: ['Product launches', 'Design systems', 'UI prototypes'],
    },
    {
      role: Role.EMPLOYER,
      name: 'Northbridge Ventures',
      bio: 'A hiring-first startup building practical AI products.',
      headline: 'Hiring for bold, cross-functional teams',
      accent: 'emerald',
      style: 'recruiter',
      highlights: ['Remote-friendly', 'Quarterly hackathons', 'Diversity and inclusion'],
    },
    {
      role: Role.CLIENT,
      name: 'Maya Consulting',
      bio: 'Connecting brands with experts to create polished launches.',
      headline: 'Growth consulting with measurable outcomes',
      accent: 'amber',
      style: 'corporate',
      highlights: ['Discovery workshops', 'Market-fit guidance', 'ROI reporting'],
    },
    {
      role: Role.ADMIN,
      name: 'Ops Lead',
      bio: 'Maintains platform quality and supports onboarding workflows.',
      headline: 'Platform Stewardship & Moderation',
      accent: 'rose',
      style: 'governance',
      highlights: ['Community safety', 'Policy ownership', 'User support'],
    },
    {
      role: Role.STUDENT,
      name: 'Lena Learns',
      bio: 'Learns fast and ships portfolio-grade projects.',
      headline: 'Full Stack + Product Exploration',
      accent: 'cyan',
      style: 'learning',
      highlights: ['Hackathon entries', 'Open-source contributions', 'Mentorship'],
    },
  ]

  for (const item of templates) {
    const user = await prisma.user.upsert({
      where: { email: `${item.name.toLowerCase().replace(/\s+/g, '-')}-${item.role.toLowerCase()}@example.com` },
      update: {
        name: item.name,
        role: item.role,
      },
      create: {
        email: `${item.name.toLowerCase().replace(/\s+/g, '-')}-${item.role.toLowerCase()}@example.com`,
        name: item.name,
        role: item.role,
      },
    })

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: item.bio,
        headline: item.headline,
        accent: item.accent,
        isPublic: true,
        customData: {
          accent: item.accent,
          style: item.style,
          highlights: item.highlights,
        } as any,
      },
      create: {
        userId: user.id,
        bio: item.bio,
        headline: item.headline,
        accent: item.accent,
        isPublic: true,
        customData: {
          accent: item.accent,
          style: item.style,
          highlights: item.highlights,
        } as any,
      },
    })
  }

  console.log('Seed done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
