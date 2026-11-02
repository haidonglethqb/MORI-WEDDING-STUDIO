import { Module } from '@nestjs/common'
import { SpikeChecksController } from './spike-checks.controller.js'
import { SpikeChecksService } from './spike-checks.service.js'

@Module({
  controllers: [SpikeChecksController],
  providers: [SpikeChecksService],
})
export class SpikeChecksModule {}
