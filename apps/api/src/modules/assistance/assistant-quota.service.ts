import { ConflictException, Injectable } from '@nestjs/common'
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
        if (existing) throw new ConflictException('The assistant quota for today is full')
        await tx.aiUsageBucket.create({ data: { subject, day, count: 1 } })
      })
    } catch (err) {
      if (err instanceof ConflictException) throw err
      if (process.env['NODE_ENV'] === 'production' || process.env['APP_ENV'] === 'production') {
        throw new ConflictException('Assistant quota verification temporarily unavailable')
      }
      const current = this.memoryBuckets.get(key) ?? 0
      if (current >= limit) {
        throw new ConflictException('The assistant quota for today is full')
      }
      this.memoryBuckets.set(key, current + 1)
    }
  }
}
