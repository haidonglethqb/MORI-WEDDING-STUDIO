import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import type { CreateSpikeCheckRequest, SpikeCheckResponse } from '@mori/contracts'

@Injectable()
export class SpikeChecksService {
  async create(dto: CreateSpikeCheckRequest): Promise<SpikeCheckResponse> {
    const prisma = getPrismaClient()
    const record = await prisma.spikeCheck.create({
      data: { note: dto.note },
    })
    return {
      id: record.id,
      note: record.note,
      createdAt: record.createdAt.toISOString(),
    }
  }
}
