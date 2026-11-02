import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

export interface AssistantContext {
  provider: 'DISABLED'
  products: Array<{ name: string; slug: string; isFixture: boolean }>
}

@Injectable()
export class AssistantContextService {
  async build(slugPrefix: string): Promise<AssistantContext> {
    const products = await getPrismaClient().product.findMany({
      where: { state: 'ACTIVE', isFixture: true, slug: { startsWith: slugPrefix } },
      select: { name: true, slug: true, isFixture: true },
    })
    return { provider: 'DISABLED', products }
  }
}
