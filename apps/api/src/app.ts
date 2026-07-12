import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { errorMiddleware } from './middlewares/errorMiddleware.js'
import { notFoundMiddleware } from './middlewares/notFoundMiddleware.js'
import router from './routes/index.js'

export function createApp() {
  const app = express()

  const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const allowedOrigins = new Set<string>([
    'http://localhost:3000',
    'http://localhost:3001',
    ...configuredOrigins,
  ])

  app.use(helmet())
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin) || isLocalhostOrigin(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`))
      },
      credentials: true,
    })
  )
  app.use(express.json({ limit: '1mb' }))

  app.use(router)
  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin)
    return parsed.protocol === 'http:' && parsed.hostname === 'localhost'
  } catch {
    return false
  }
}
