import { Controller, Post, Body, UsePipes, HttpCode, HttpStatus } from '@nestjs/common'
import { SpikeChecksService } from './spike-checks.service.js'
import { ZodValidationPipe } from '../common/zod-validation.pipe.js'
import {
  CreateSpikeCheckRequestSchema,
  type CreateSpikeCheckRequest,
  type SpikeCheckResponse,
} from '@mori/contracts'

@Controller('spike-checks')
export class SpikeChecksController {
  constructor(private readonly service: SpikeChecksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateSpikeCheckRequestSchema))
  create(@Body() dto: CreateSpikeCheckRequest): Promise<SpikeCheckResponse> {
    return this.service.create(dto)
  }
}
