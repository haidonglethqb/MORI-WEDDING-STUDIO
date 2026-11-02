// reflect-metadata must be the very first import for NestJS DI to work in ESM
import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'
import { WorkerModule } from './worker.module.js'
import { loadEnv } from '@mori/config'
import { getPrismaClient, disconnectPrismaClient, claimNotificationTasks } from '@mori/database'

async function bootstrap(): Promise<void> {
  const env = loadEnv()
  console.log(`[worker] Starting in ${env.APP_ENV} mode`)

  // Verify DB connectivity on startup
  try {
    const prisma = getPrismaClient()
    await prisma.$queryRaw`SELECT 1`
    console.log('[worker] Database connection: OK')
  } catch (err) {
    console.error('[worker] Database connection failed:', err)
    process.exit(1)
  }

  // Create minimal NestJS context for module system (no HTTP server)
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['error', 'warn', 'log'],
  })

  console.log('[worker] Ready — awaiting tasks')

  let claiming = false
  const claimTimer = setInterval(() => {
    if (claiming) return
    claiming = true
    void claimNotificationTasks()
      .then((count) => {
        if (count > 0) console.log(`[worker] Closed ${count} notification task(s)`)
      })
      .catch((err: unknown) => {
        console.error('[worker] Notification task claim failed:', err)
      })
      .finally(() => {
        claiming = false
      })
  }, 5_000)

  const keepAlive = setInterval(() => undefined, 60_000)

  await new Promise<void>((resolve) => {
    const shutdown = (signal: string): void => {
      console.log(`[worker] ${signal} received, shutting down`)
      clearInterval(keepAlive)
      clearInterval(claimTimer)
      resolve()
    }
    process.once('SIGTERM', () => shutdown('SIGTERM'))
    process.once('SIGINT', () => shutdown('SIGINT'))
  })

  await app.close()
  await disconnectPrismaClient()
}

void bootstrap()
