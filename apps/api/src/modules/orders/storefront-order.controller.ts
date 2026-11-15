import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  CreateCustomRequestSchema,
  CreateStorefrontOrderSchema,
  SESSION_COOKIE,
  UpdateCustomRequestSchema,
  UpdateStorefrontOrderSchema,
  type CreateCustomRequestInput,
  type CreateStorefrontOrderInput,
  type UpdateCustomRequestInput,
  type UpdateStorefrontOrderInput,
} from '@mori/contracts'
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { StorefrontOrderService } from './storefront-order.service.js'

const PRIVATE = 'private, no-store'

@Controller('storefront')
export class StorefrontOrderController {
  constructor(
    private readonly storefront: StorefrontOrderService,
    private readonly identity: IdentityService,
  ) {}

  @Post('orders')
  @HttpCode(201)
  @Header('Cache-Control', PRIVATE)
  createOrder(
    @Body(new ZodValidationPipe(CreateStorefrontOrderSchema)) body: CreateStorefrontOrderInput,
  ) {
    const order = this.storefront.createOrder(body)
    return { ok: true, order }
  }

  @Get('orders/track')
  @Header('Cache-Control', PRIVATE)
  trackOrder(@Query('code') code?: string, @Query('contact') contact?: string) {
    return this.storefront.trackOrder(code, contact)
  }

  @Get('orders')
  @Header('Cache-Control', PRIVATE)
  async listOrders(@Headers('cookie') cookie: string | undefined) {
    await this.verifyStaff(cookie)
    return this.storefront.listOrders()
  }

  @Patch('orders/:code')
  @Header('Cache-Control', PRIVATE)
  async updateOrder(
    @Headers('cookie') cookie: string | undefined,
    @Param('code') code: string,
    @Body(new ZodValidationPipe(UpdateStorefrontOrderSchema)) body: UpdateStorefrontOrderInput,
  ) {
    await this.verifyStaff(cookie)
    const order = this.storefront.updateOrder(code, body)
    return { ok: true, order }
  }

  @Post('custom-requests')
  @HttpCode(201)
  @Header('Cache-Control', PRIVATE)
  createCustomRequest(
    @Body(new ZodValidationPipe(CreateCustomRequestSchema)) body: CreateCustomRequestInput,
  ) {
    const request = this.storefront.createCustomRequest(body)
    return { ok: true, request }
  }

  @Get('custom-requests')
  @Header('Cache-Control', PRIVATE)
  async listCustomRequests(@Headers('cookie') cookie: string | undefined) {
    await this.verifyStaff(cookie)
    return this.storefront.listCustomRequests()
  }

  @Patch('custom-requests/:id')
  @Header('Cache-Control', PRIVATE)
  async updateCustomRequest(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCustomRequestSchema)) body: UpdateCustomRequestInput,
  ) {
    await this.verifyStaff(cookie)
    const request = this.storefront.updateCustomRequest(id, body)
    return { ok: true, request }
  }

  private async verifyStaff(cookie: string | undefined): Promise<void> {
    const token = readCookie(cookie, SESSION_COOKIE)
    if (!token) throw new NotFoundException()
    try {
      const user = await this.identity.currentUser(token)
      if ((user.role !== 'ADMIN' && user.role !== 'STUDIO') || user.status !== 'ACTIVE') {
        throw new NotFoundException()
      }
    } catch {
      throw new NotFoundException()
    }
  }
}
