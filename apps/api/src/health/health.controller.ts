import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Controller('health')
export class HealthController {
  /** Liveness: returns 200 when the process is running. No dependency checks. */
  @Get('live')
  live(): { status: string } {
    return { status: 'ok' }
  }

  /**
   * Readiness: returns 200 when the database is reachable.
   * Returns 503 when the DB is unavailable (per spec 17.6).
   */
  @Get('ready')
  async ready(): Promise<{ status: string; checks: Record<string, string> }> {
    const checks: Record<string, string> = {}

    try {
      const prisma = getPrismaClient()
      await prisma.$queryRaw`SELECT 1`
      checks['database'] = 'ok'
    } catch {
      checks['database'] = 'unavailable'
      throw new ServiceUnavailableException({
        status: 'degraded',
        checks: { database: 'unavailable' },
      })
    }

    return { status: 'ok', checks }
  }
}
