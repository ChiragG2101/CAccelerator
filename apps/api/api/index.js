import { createApp } from '../dist/app.js'
import { connectDatabase } from '../dist/config/database.js'
import { env } from '../dist/config/env.js'

const app = createApp()
let dbConnectionPromise = null

async function ensureDatabaseConnection() {
  if (env.DUMMY_API_MODE || !env.MONGODB_URI) {
    return
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDatabase(env.MONGODB_URI)
  }

  await dbConnectionPromise
}

export default async function handler(req, res) {
  await ensureDatabaseConnection()
  return app(req, res)
}
