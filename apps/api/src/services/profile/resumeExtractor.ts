import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import mammoth from 'mammoth'

const require = createRequire(import.meta.url)
const pdf = require('pdf-parse/lib/pdf-parse.js') as (buffer: Buffer) => Promise<{ text: string }>

export const MAX_RESUME_BYTES = 5 * 1024 * 1024
export const allowedResumeMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export interface ExtractedResume {
  text: string
  contentHash: string
  extractionVersion: 'v1'
  warnings: string[]
}

export async function extractResume(file: Express.Multer.File): Promise<ExtractedResume> {
  if (!allowedResumeMimeTypes.has(file.mimetype)) throw Object.assign(new Error('Only PDF and DOCX resumes are supported'), { status: 415, code: 'UNSUPPORTED_RESUME_TYPE' })
  if (!file.buffer.length || file.buffer.length > MAX_RESUME_BYTES) throw Object.assign(new Error('Resume must be between 1 byte and 5 MB'), { status: 413, code: 'RESUME_TOO_LARGE' })
  const isPdf = file.buffer.subarray(0, 5).toString('ascii') === '%PDF-'
  const isZip = file.buffer[0] === 0x50 && file.buffer[1] === 0x4b
  if ((file.mimetype === 'application/pdf' && !isPdf) || (file.mimetype !== 'application/pdf' && !isZip)) {
    throw Object.assign(new Error('Resume content does not match its declared file type'), { status: 415, code: 'RESUME_TYPE_MISMATCH' })
  }

  let text: string
  if (file.mimetype === 'application/pdf') {
    text = (await pdf(file.buffer)).text
  } else {
    text = (await mammoth.extractRawText({ buffer: file.buffer })).value
  }
  text = text.replace(/\0/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  if (text.length < 20) throw Object.assign(new Error('Resume does not contain enough extractable text'), { status: 422, code: 'RESUME_TEXT_EMPTY' })
  if (text.length > 100_000) throw Object.assign(new Error('Extracted resume text exceeds the 100,000 character limit'), { status: 413, code: 'RESUME_TEXT_TOO_LARGE' })

  return {
    text,
    contentHash: createHash('sha256').update(file.buffer).digest('hex'),
    extractionVersion: 'v1',
    warnings: [],
  }
}
