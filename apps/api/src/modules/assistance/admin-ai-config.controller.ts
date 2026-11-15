import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  UnprocessableEntityException,
} from '@nestjs/common'
import { SESSION_COOKIE, type CurrentUser } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { AiConfigService, type AiSystemConfig } from './ai-config.service.js'
import { AiLogService } from './ai-log.service.js'
import { AiProviderTesterService } from './ai-provider-tester.service.js'

const PRIVATE = 'private, no-store'

const AVAILABLE_CODEX_MODELS = [
  'gpt-6.1-sol',
  'gpt-6.1-terra',
  'gpt-6-sol',
  'gpt-6-luna',
  'gpt-6-astra',
  'gpt-5.6-sol',
  'gpt-5.6-terra',
]

const AVAILABLE_GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
]

@Controller('admin/ai-config')
export class AdminAiConfigController {
  constructor(
    private readonly configService: AiConfigService,
    private readonly logService: AiLogService,
    private readonly identity: IdentityService,
    private readonly testerService: AiProviderTesterService,
  ) {}

  @Get()
  @Header('Cache-Control', PRIVATE)
  async getConfig(@Headers('cookie') cookie: string | undefined) {
    await this.verifyAdmin(cookie)
    return {
      config: this.configService.getMaskedConfig(),
      availableCodexModels: AVAILABLE_CODEX_MODELS,
      availableGroqModels: AVAILABLE_GROQ_MODELS,
    }
  }

  @Get('logs')
  @Header('Cache-Control', PRIVATE)
  async getLogs(@Headers('cookie') cookie: string | undefined) {
    await this.verifyStaff(cookie)
    return this.logService.getSessions(50)
  }

  @Post('sessions/:id/reply')
  @HttpCode(200)
  @Header('Cache-Control', PRIVATE)
  async replyToSession(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: { message?: string; resolveEscalation?: boolean },
  ) {
    const staff = await this.verifyStaff(cookie)
    const msg = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!msg) throw new UnprocessableEntityException('Vui lòng nhập nội dung phản hồi')

    const sender = staff.displayName?.trim() || (staff.role === 'ADMIN' ? 'Admin MORI' : 'Studio MORI')
    const session = this.logService.addAdminReply(id, {
      sender,
      message: msg,
      resolveEscalation: body?.resolveEscalation,
    })
    if (!session) throw new NotFoundException('Không tìm thấy phiên hội thoại')
    return { ok: true, session }
  }

  @Delete('logs')
  @HttpCode(200)
  @Header('Cache-Control', PRIVATE)
  async clearLogs(@Headers('cookie') cookie: string | undefined) {
    await this.verifyAdmin(cookie)
    this.logService.clearSessions()
    return { success: true }
  }

  @Delete('sessions/:id')
  @HttpCode(200)
  @Header('Cache-Control', PRIVATE)
  async deleteSession(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
  ) {
    await this.verifyAdmin(cookie)
    return { success: this.logService.deleteSession(id) }
  }

  @Put()
  @HttpCode(200)
  @Header('Cache-Control', PRIVATE)
  async updateConfig(
    @Headers('cookie') cookie: string | undefined,
    @Body() body: Partial<AiSystemConfig>,
  ) {
    await this.verifyAdmin(cookie)
    const updated = this.configService.updateConfig(body)
    return {
      success: true,
      config: this.configService.getMaskedConfig(),
      updatedProvider: updated.provider,
    }
  }

  @Post('test')
  @HttpCode(200)
  @Header('Cache-Control', PRIVATE)
  async testConnection(
    @Headers('cookie') cookie: string | undefined,
    @Body() body: {
      provider?: 'CODEX' | 'GROQ'
      apiKey?: string
      baseUrl?: string
      model?: string
    },
  ) {
    await this.verifyAdmin(cookie)
    return this.testerService.testConnection(body)
  }

  private async verifyAdmin(cookie: string | undefined): Promise<CurrentUser> {
    const user = await this.verifyStaff(cookie)
    if (user.role !== 'ADMIN') throw new NotFoundException()
    return user
  }

  private async verifyStaff(cookie: string | undefined): Promise<CurrentUser> {
    const token = readCookie(cookie, SESSION_COOKIE)
    if (!token) throw new NotFoundException()
    try {
      const user = await this.identity.currentUser(token)
      if ((user.role !== 'ADMIN' && user.role !== 'STUDIO') || user.status !== 'ACTIVE') {
        throw new NotFoundException()
      }
      return user
    } catch {
      throw new NotFoundException()
    }
  }
}
