import { createHash } from 'node:crypto'

export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
}

export function buildJobFingerprint(input: {
  title: string
  company: string
  location: string
  applyUrl: string
}): string {
  const canonical = [input.title, input.company, input.location, input.applyUrl]
    .map((part) => normalizeText(part))
    .join('|')

  return createHash('sha1').update(canonical).digest('hex')
}
