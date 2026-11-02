import { Controller, Get, Query } from '@nestjs/common'
import { CatalogueQuerySchema } from '@mori/contracts'
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js'
import { CatalogueService } from './catalogue.service.js'

@Controller('catalog/products')
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(CatalogueQuerySchema))
    query: ReturnType<typeof CatalogueQuerySchema.parse>,
  ) {
    return this.catalogue.list(query)
  }
}
