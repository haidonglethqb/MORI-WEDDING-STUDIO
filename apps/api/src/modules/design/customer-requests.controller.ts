import { Body, Controller, Get, Header, Headers, NotFoundException, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { CustomerRequestsService } from './customer-requests.service.js'
import { approveProofCommand } from './proof-command.js'
import { ProofOpenService } from './proof-open.service.js'

const PRIVATE = 'private, no-store'

@Controller('requests')
export class CustomerRequestsController {
  constructor(
    private readonly requests: CustomerRequestsService,
    private readonly proofs: ProofOpenService,
    private readonly identity: IdentityService,
  ) {}

  @Get('mine')
  @Header('Cache-Control', PRIVATE)
  async mine(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.requests.list(user.id)
  }

  @Post('mine')
  @Header('Cache-Control', PRIVATE)
  async start(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: { kind?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.requests.start(user.id, body.kind ?? '', idempotencyKey ?? '')
  }

  @Get(':id/messages')
  @Header('Cache-Control', PRIVATE)
  async thread(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.requests.thread(user.id, id)
  }

  @Get(':id/revisions')
  @Header('Cache-Control', PRIVATE)
  async revisions(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.proofs.listForCustomer(user.id, id)
  }

  @Post(':id/revisions/:revisionId/approve')
  @Header('Cache-Control', PRIVATE)
  async approve(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Param('revisionId') revisionId: string,
    @Body() body: unknown,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    const proofs = await this.proofs.listForCustomer(user.id, id)
    if (!proofs.some((proof) => proof.revisionId === revisionId)) throw new NotFoundException()
    await approveProofCommand(user.id, revisionId, body)
    return { approved: true }
  }

  @Post(':id/messages')
  @Header('Cache-Control', PRIVATE)
  async reply(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { plainText?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.requests.reply(user.id, id, body.plainText ?? '', idempotencyKey ?? '')
    return { accepted: true }
  }
}
