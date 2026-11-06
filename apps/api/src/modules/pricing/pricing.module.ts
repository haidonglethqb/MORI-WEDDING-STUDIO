import { Module } from '@nestjs/common'
import { EstimateController } from './estimate.controller.js'
import { EstimateService } from './estimate.service.js'

@Module({
  controllers: [EstimateController],
  providers: [EstimateService],
  exports: [EstimateService],
})
export class PricingModule {}
