import { ConflictException, Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class AssistantQuotaService {
  async reserve(subject: string, limit: number): Promise<void> {
    const day = new Date().toISOString().slice(0, 10)
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      const updated = await tx.$queryRaw<{ count: number }[]>`
        UPDATE ai_usage_buckets
        SET count = count + 1
        WHERE subject = ${subject} AND day = ${day} AND count < ${limit}
        RETURNING count
      `
      if (updated[0]) return
      const existing = await tx.aiUsageBucket.findUnique({ where: { subject_day: { subject, day } } })
      if (existing) throw new ConflictException('The assistant quota for today is full')
      await tx.aiUsageBucket.create({ data: { subject, day, count: 1 } })
    })
  }
}
