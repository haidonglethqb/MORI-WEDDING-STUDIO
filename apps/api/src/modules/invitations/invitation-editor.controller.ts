import { Body, Controller, Get, Header, Headers, Param, Patch, Post } from '@nestjs/common'
import {
  PublishInvitationSchema,
  SaveInvitationDraftSchema,
  SESSION_COOKIE,
  type PublishInvitation,
  type SaveInvitationDraft,
} from '@mori/contracts'
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js'
import { assertActiveUser } from '../identity/assert-active-user.js'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { InvitationEditorService } from './invitation-editor.service.js'

const PRIVATE = 'private, no-store'

@Controller('invitations')
export class InvitationEditorController {
  constructor(
    private readonly editor: InvitationEditorService,
    private readonly identity: IdentityService,
  ) {}

  @Get(':id/editor')
  @Header('Cache-Control', PRIVATE)
  async read(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    assertActiveUser(user)
    return this.editor.read(user.id, id)
  }

  @Patch(':id/editor')
  @Header('Cache-Control', PRIVATE)
  async save(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SaveInvitationDraftSchema)) body: SaveInvitationDraft,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    assertActiveUser(user)
    return this.editor.save(user.id, id, body)
  }

  @Post(':id/publish')
  @Header('Cache-Control', PRIVATE)
  async publish(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(PublishInvitationSchema)) body: PublishInvitation,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    assertActiveUser(user)
    return this.editor.publish(user.id, id, body.expectedVersion)
  }
}
