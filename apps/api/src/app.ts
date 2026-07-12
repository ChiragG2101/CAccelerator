import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { errorMiddleware } from './middlewares/errorMiddleware.js'
import { notFoundMiddleware } from './middlewares/notFoundMiddleware.js'
import router from './routes/index.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }))
  app.use(express.json({ limit: '1mb' }))

  app.use(router)
  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
