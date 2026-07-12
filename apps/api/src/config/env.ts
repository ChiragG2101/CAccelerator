import path from 'node:path'

import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  LINKUP_API_KEY: z.string().min(1).optional(),
  LINKUP_BASE_URL: z.string().url().default('https://api.linkup.so/v1'),
  DUMMY_API_MODE: z.coerce.boolean().default(true),
})

export const env = envSchema.parse(process.env)
