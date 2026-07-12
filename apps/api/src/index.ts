import { createApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'

const mongoUri = env.MONGODB_URI

if (!env.DUMMY_API_MODE && mongoUri) {
  await connectDatabase(mongoUri)
} else {
  console.log('Running API in dummy mode (in-memory data, no database connection).')
}

const app = createApp()

const server = app.listen(env.API_PORT, () => {
  console.log(`API listening on http://localhost:${env.API_PORT}`)
})

async function shutdown() {
  server.close(async () => {
    if (!env.DUMMY_API_MODE && mongoUri) {
      await disconnectDatabase()
    }
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)