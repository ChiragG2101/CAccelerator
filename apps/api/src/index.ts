import dotenv from 'dotenv'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { z } from 'zod'
import { PrismaClient, Prisma, Role } from '@prisma/client'

const envPath = path.resolve(__dirname, '../../.env')
dotenv.config({ path: envPath })

const app = express()
const prisma = new PrismaClient()

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }))
app.use(express.json())

const port = Number(process.env.API_PORT || 4000)

const profileCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.nativeEnum(Role).default(Role.CREATOR),
  bio: z.string().optional(),
  headline: z.string().optional(),
  accent: z.string().optional(),
  style: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  isPublic: z.boolean().optional().default(true),
})

const parseProfile = (user: {
  id: string
  email: string
  name: string | null
  role: Role
  profile: {
    id: string
    bio: string | null
    headline: string | null
    customData: Record<string, unknown> | null
    isPublic: boolean
    theme?: string | null
  } | null
}): {
  id: string
  email: string
  name: string | null
  role: Role
  bio: string | null
  headline: string | null
  isPublic: boolean
  theme: {
    accent?: string
    style?: string
  }
  customHighlights: string[]
} => {
  const custom = (user.profile?.customData as { accent?: string; style?: string; highlights?: string[] }) || {}
  const highlights = Array.isArray(custom?.highlights)
    ? custom.highlights
    : []

  return {
    id: user.profile?.id || user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    bio: user.profile?.bio || null,
    headline: user.profile?.headline || null,
    isPublic: Boolean(user.profile?.isPublic),
    theme: {
      accent: custom.accent || user.profile?.theme || 'brand',
      style: custom.style || 'standard',
    },
    customHighlights: highlights,
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'roles-api' })
})

app.get('/roles', (_req, res) => {
  res.json({ roles: Object.values(Role) })
})

app.get('/profiles', async (req, res) => {
  const isPublic = req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined
  const role = req.query.role as Role | undefined

  const where: Prisma.UserWhereInput = {}
  if (typeof isPublic === 'boolean') {
    where.profile = { isPublic }
  }
  if (role && Object.values(Role).includes(role)) {
    where.role = role
  }

  const users = await prisma.user.findMany({
    where,
    include: { profile: true },
    orderBy: { createdAt: 'desc' },
  })

  const data = users.map((user) => parseProfile(user as any))
  res.json(data)
})

app.get('/profiles/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { profile: true },
  })

  if (!user || !user.profile) {
    return res.status(404).json({ error: 'Profile not found' })
  }

  res.json(parseProfile(user))
})

app.post('/profiles', async (req, res) => {
  const parsed = profileCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const payload = parsed.data

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    })

    const profile = await tx.profile.create({
      data: {
        userId: user.id,
        bio: payload.bio || null,
        headline: payload.headline || null,
        isPublic: payload.isPublic,
        customData: {
          accent: payload.accent || 'brand',
          style: payload.style || 'standard',
          highlights: payload.highlights,
        },
      },
    })

    return { ...user, profile }
  })

  res.status(201).json(parseProfile(created))
})

app.listen(port, () => {
  console.log(`Roles API listening on http://localhost:${port}`)
})
