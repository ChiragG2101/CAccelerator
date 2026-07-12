import { createRequire } from 'node:module'
import cors from 'cors'
import express, { type RequestHandler } from 'express'
import helmet from 'helmet'
import type { CareerRuntime } from './domain.js'
import { requireAuth, requestId } from './middlewares/auth.js'
import { errorMiddleware } from './middlewares/errorMiddleware.js'
import { notFoundMiddleware } from './middlewares/notFoundMiddleware.js'
import { createRouter } from './routes/index.js'
import { MongooseCareerStore, type CareerStore } from './services/careerStore.js'

const require = createRequire(import.meta.url)
export interface AppOptions { store?: CareerStore; authMiddleware?: RequestHandler; clerkMiddleware?: RequestHandler; runtime?: CareerRuntime }

export function createApp(options: AppOptions = {}) {
  const app = express()
  const allowedOrigins = new Set(['http://localhost:3000', 'http://localhost:3001', ...(process.env.CORS_ORIGIN ?? '').split(',').map((value) => value.trim()).filter(Boolean)])
  app.use(helmet())
  app.use(cors({ origin: (origin, callback) => !origin || allowedOrigins.has(origin) ? callback(null, true) : callback(new Error('Origin is not allowed by CORS')), credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(requestId)
  if (!options.authMiddleware) {
    const middleware = options.clerkMiddleware ?? (require('@clerk/express') as { clerkMiddleware(): RequestHandler }).clerkMiddleware()
    app.use(middleware)
  }
  app.use(createRouter(options.store ?? new MongooseCareerStore(), options.authMiddleware ?? requireAuth, options.runtime))
  app.use(notFoundMiddleware)
  app.use(errorMiddleware)
  return app
}
