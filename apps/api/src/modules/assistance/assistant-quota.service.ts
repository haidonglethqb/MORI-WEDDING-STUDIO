import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class AssistantQuotaService {
  private readonly memoryBuckets = new Map<string, number>()

  async reserve(subject: string, limit: number): Promise<void> {
    const day = new Date().toISOString().slice(0, 10)
    const key = `${subject}:${day}`

    try {
      const prisma = getPrismaClient()
      await prisma.$transaction(async (tx) => {
        const updated = await tx.$queryRaw<{ count: number }[]>`
          UPDATE ai_usage_buckets
          SET count = count + 1
          WHERE subject = ${subject} AND day = ${day} AND count < ${limit}
          RETURNING count
        `
        if (updated[0]) return
        const existing = await tx.aiUsageBucket.findUnique({
          where: { subject_day: { subject, day } },
        })
        if (existing) {
          throw new HttpException(
            { code: 'AI_QUOTA_EXCEEDED', message: 'The assistant quota for today is full' },
            HttpStatus.TOO_MANY_REQUESTS,
          )
        }
        await tx.aiUsageBucket.create({ data: { subject, day, count: 1 } })
      })
    } catch (err) {
      if (err instanceof HttpException) throw err
      if (process.env['NODE_ENV'] === 'production' || process.env['APP_ENV'] === 'production') {
        throw new HttpException(
          { code: 'ASSISTANT_UNAVAILABLE', message: 'Assistant quota verification temporarily unavailable' },
          HttpStatus.SERVICE_UNAVAILABLE,
        )
      }
      const current = this.memoryBuckets.get(key) ?? 0
      if (current >= limit) {
        throw new HttpException(
          { code: 'AI_QUOTA_EXCEEDED', message: 'The assistant quota for today is full' },
          HttpStatus.TOO_MANY_REQUESTS,
        )
      }
      this.memoryBuckets.set(key, current + 1)
    }
  }
}
