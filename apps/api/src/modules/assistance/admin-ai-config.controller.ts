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
} from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { AiConfigService, type AiSystemConfig } from './ai-config.service.js'
import { AiLogService } from './ai-log.service.js'

const PRIVATE = 'private, no-store'
const SESSION_COOKIE = 'mori_session'

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
    await this.verifyAdmin(cookie)
    return this.logService.getSessions(50)
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
    const cfg = this.configService.getConfig()
    const targetProvider = body.provider ?? cfg.provider
    const targetKey = body.apiKey && body.apiKey.trim()
      ? body.apiKey.trim()
      : targetProvider === 'CODEX' ? cfg.codexApiKey : cfg.groqApiKey
    const targetBaseUrl = body.baseUrl && body.baseUrl.trim()
      ? body.baseUrl.trim()
      : targetProvider === 'CODEX' ? cfg.codexBaseUrl : 'https://api.groq.com/openai/v1'
    const targetModel = body.model && body.model.trim()
      ? body.model.trim()
      : targetProvider === 'CODEX' ? cfg.codexPrimaryModel : cfg.groqPrimaryModel

    if (!targetKey) {
      return { ok: false, error: 'Chưa có API Key được cấu hình' }
    }

    const endpoint = `${targetBaseUrl.replace(/\/+$/, '')}/chat/completions`
    const start = Date.now()

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${targetKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'user', content: 'Xin chào nghệ nhân MORI!' },
          ],
          temperature: 0.3,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer))

      if (!response.ok) {
        const text = await response.text()
        return { ok: false, status: response.status, error: text.slice(0, 200) }
      }

      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const reply = json.choices?.[0]?.message?.content ?? ''

      return {
        ok: true,
        latencyMs: Date.now() - start,
        model: targetModel,
        sampleReply: reply.slice(0, 150),
      }
    } catch (err) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  private async verifyAdmin(cookie: string | undefined): Promise<void> {
    if (process.env['APP_ENV'] !== 'production') return
    try {
      const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
      const admin = await getPrismaClient().user.findFirst({
        where: { id: user.id, role: 'ADMIN', status: 'ACTIVE' },
      })
      if (!admin) throw new NotFoundException()
    } catch {
      throw new NotFoundException()
    }
  }
}
