import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { EstimateRequestSchema } from '@mori/contracts'
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js'
import { EstimateService } from './estimate.service.js'

@Controller('pricing')
export class EstimateController {
  constructor(private readonly estimates: EstimateService) {}

  @Post('estimate')
  @HttpCode(200)
  estimate(
    @Body(new ZodValidationPipe(EstimateRequestSchema))
    body: ReturnType<typeof EstimateRequestSchema.parse>,
  ) {
    return this.estimates.estimate(body)
  }
}
