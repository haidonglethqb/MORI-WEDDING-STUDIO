import { Body, Controller, Header, Headers, Param, Post } from '@nestjs/common'
import { UnprocessableEntityException } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { MediaUploadService } from './media-upload.service.js'

const PRIVATE = 'private, no-store'

@Controller('media/uploads')
export class MediaUploadController {
  constructor(
    private readonly uploads: MediaUploadService,
    private readonly identity: IdentityService,
  ) {}

  @Post()
  @Header('Cache-Control', PRIVATE)
  async open(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body()
    body: { projectId?: string; purpose?: string; expectedBytes?: number; declaredMime?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.uploads.open({
      ownerUserId: user.id,
      projectId: body.projectId ?? '',
      purpose: body.purpose ?? '',
      expectedBytes: body.expectedBytes ?? 0,
      declaredMime: body.declaredMime ?? '',
      idempotencyKey: idempotencyKey ?? '',
    })
  }

  @Post(':id/complete')
  @Header('Cache-Control', PRIVATE)
  async complete(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: { bytesBase64?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    const encoded = body.bytesBase64 ?? ''
    if (encoded.length > 14_000_000) throw new UnprocessableEntityException('This image must be between 1 byte and 10 MB')
    return this.uploads.complete(user.id, id, Buffer.from(encoded, 'base64'))
  }
}
