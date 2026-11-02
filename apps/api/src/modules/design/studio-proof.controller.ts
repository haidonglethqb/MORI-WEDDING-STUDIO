import { Body, Controller, Get, Header, Headers, Param, Post, UnprocessableEntityException } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { ProofOpenService } from './proof-open.service.js'

const PRIVATE = 'private, no-store'

@Controller('studio')
export class StudioProofController {
  constructor(
    private readonly proofs: ProofOpenService,
    private readonly identity: IdentityService,
  ) {}

  @Get('requests/:id/revisions')
  @Header('Cache-Control', PRIVATE)
  async list(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.proofs.listForStaff(user.id, id)
  }

  @Post('requests/:id/revisions')
  @Header('Cache-Control', PRIVATE)
  async open(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { manifestHash?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.proofs.open({
      actorUserId: user.id,
      requestId: id,
      manifestHash: body.manifestHash ?? '',
      idempotencyKey: idempotencyKey ?? '',
    })
  }

  @Post('revisions/:revisionId/prepare')
  @Header('Cache-Control', PRIVATE)
  async prepare(
    @Headers('cookie') cookie: string | undefined,
    @Param('revisionId') revisionId: string,
    @Body() body: PrepareBody,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.proofs.prepare(user.id, revisionId, parsePrepare(body))
    return { revisionId }
  }

  @Post('revisions/:revisionId/submit')
  @Header('Cache-Control', PRIVATE)
  async submit(
    @Headers('cookie') cookie: string | undefined,
    @Param('revisionId') revisionId: string,
    @Body() body: { requestId?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.proofs.submit(user.id, body.requestId ?? '', revisionId)
    return { revisionId, state: 'IN_REVIEW' }
  }
}

interface PrepareBody {
  renderState?: string
  faceMapComplete?: boolean
  fontsReady?: boolean
  trimWidthMm?: number
  trimHeightMm?: number
  profileWidthMm?: number
  profileHeightMm?: number
}

function parsePrepare(body: PrepareBody) {
  const renderState = body.renderState === 'FAILED' ? 'FAILED' : body.renderState === 'READY' ? 'READY' : ''
  const millimetres = [body.trimWidthMm, body.trimHeightMm, body.profileWidthMm, body.profileHeightMm]
  if (!renderState || millimetres.some((value) => !Number.isInteger(value) || (value ?? 0) < 1)) {
    throw new UnprocessableEntityException('A proof needs a render state and fixture measurements')
  }
  return {
    renderState: renderState as 'READY' | 'FAILED',
    faceMapComplete: body.faceMapComplete === true,
    fontsReady: body.fontsReady === true,
    trimWidthMm: body.trimWidthMm ?? 0,
    trimHeightMm: body.trimHeightMm ?? 0,
    profileWidthMm: body.profileWidthMm ?? 0,
    profileHeightMm: body.profileHeightMm ?? 0,
  }
}
