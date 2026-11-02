// reflect-metadata must be the very first import for NestJS DI to work in ESM
import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { securityHeadersMiddleware } from './common/security-headers.js'
import { loadEnv } from '@mori/config'

async function bootstrap(): Promise<void> {
  const env = loadEnv()
  const port = env.PORT

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  // All routes prefixed with /api/v1
  app.setGlobalPrefix('api/v1')
  app.use(securityHeadersMiddleware)

  await app.listen(port)
  console.log(`API listening on http://0.0.0.0:${port}`)
}

void bootstrap()
