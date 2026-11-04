// reflect-metadata must be the very first import for NestJS DI to work in ESM
import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'
import { WorkerModule } from './worker.module.js'
import { TaskWorkerService } from './task-worker.service.js'
import { loadEnv } from '@mori/config'
import { getPrismaClient, disconnectPrismaClient } from '@mori/database'

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
  const taskWorker = app.get(TaskWorkerService)

  console.log('[worker] Ready — awaiting tasks')

  let running = false
  const claimTimer = setInterval(() => {
    if (running) return
    running = true
    void taskWorker
      .processTasks()
      .catch((err: unknown) => {
        console.error('[worker] Task worker error:', err)
      })
      .finally(() => {
        running = false
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
