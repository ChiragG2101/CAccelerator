import { z } from 'zod'

const linkupResponseSchema = z.object({
  answer: z.string().min(1),
  sources: z.array(z.object({ name: z.string().optional(), url: z.string().url(), snippet: z.string().optional() })).default([]),
})

export interface LinkupLinkedInResult {
  profileText: string
  sources: Array<{ name?: string; url: string; snippet?: string }>
}

export async function enrichLinkedInProfile(linkedinUrl: string, options: { apiKey?: string; baseUrl?: string; fetchImpl?: typeof fetch } = {}): Promise<LinkupLinkedInResult> {
  const apiKey = options.apiKey ?? process.env.LINKUP_API_KEY
  if (!apiKey) throw Object.assign(new Error('LinkedIn enrichment is not configured'), { status: 503, code: 'LINKUP_NOT_CONFIGURED' })
  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl(`${options.baseUrl ?? process.env.LINKUP_API_URL ?? 'https://api.linkup.so/v1'}/search`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: `Read the public LinkedIn profile at ${linkedinUrl}. Return only publicly visible candidate facts: headline, summary, roles, employers, dates, education, skills, locations, and achievements. Do not infer or invent missing facts.`,
      depth: 'standard',
      outputType: 'sourcedAnswer',
      includeDomains: ['linkedin.com'],
      includeImages: false,
    }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw Object.assign(new Error('LinkedIn enrichment provider request failed'), { status: response.status === 429 ? 429 : 502, code: response.status === 429 ? 'LINKUP_RATE_LIMITED' : 'LINKUP_UNAVAILABLE' })
  const parsed = linkupResponseSchema.safeParse(await response.json())
  if (!parsed.success) throw Object.assign(new Error('LinkedIn enrichment provider returned an invalid response'), { status: 502, code: 'LINKUP_BAD_RESPONSE' })
  return { profileText: parsed.data.answer, sources: parsed.data.sources }
}
