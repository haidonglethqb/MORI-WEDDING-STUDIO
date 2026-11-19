import { Body, Controller, Get, Header, Headers, HttpCode, NotFoundException, Param, Put } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { getPrismaClient } from '@mori/database'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { AiConfigService } from './ai-config.service.js'
import { AssistantQuotaService } from './assistant-quota.service.js'

const PRIVATE = 'private, no-store'

@Controller('admin/ai-config/user-quotas')
export class AdminUserQuotaController {
  constructor(
    private readonly configService: AiConfigService,
    private readonly quotaService: AssistantQuotaService,
    private readonly identity: IdentityService,
  ) {}

  @Get()
  @Header('Cache-Control', PRIVATE)
  async list(@Headers('cookie') cookie: string | undefined) {
    await this.verifyAdmin(cookie)
    const usageMap = await this.quotaService.getTodayUsageMap()
    const defaultUserDailyLimit = this.configService.getConfig().defaultUserDailyLimit

    let users: Array<{
      id: string
      displayName: string
      email: string
      role: string
      status: string
      todayUsed: number
      customDailyLimit: number | null
      effectiveDailyLimit: number | null
    }> = []

    try {
      const rows = await getPrismaClient().user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: { id: true, displayName: true, normalizedEmail: true, role: true, status: true },
      })
      users = rows.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        email: u.normalizedEmail,
        role: u.role,
        status: u.status,
        todayUsed: usageMap[u.id] ?? 0,
        customDailyLimit: this.configService.getCustomUserLimit(u.id),
        effectiveDailyLimit: this.configService.getUserDailyLimit(u.id),
      }))
    } catch {
      users = []
    }

    return { defaultUserDailyLimit, users }
  }

  @Put('default')
  @HttpCode(200)
  @Header('Cache-Control', PRIVATE)
  async updateDefault(
    @Headers('cookie') cookie: string | undefined,
    @Body() body: { defaultUserDailyLimit?: number | null },
  ) {
    await this.verifyAdmin(cookie)
    const saved = this.configService.setDefaultUserDailyLimit(body?.defaultUserDailyLimit ?? null)
    return { ok: true, defaultUserDailyLimit: saved }
  }

  @Put(':userId')
  @HttpCode(200)
  @Header('Cache-Control', PRIVATE)
  async updateForUser(
    @Headers('cookie') cookie: string | undefined,
    @Param('userId') userId: string,
    @Body() body: { dailyLimit?: number | null },
  ) {
    await this.verifyAdmin(cookie)
    const saved = this.configService.setUserDailyLimit(userId, body?.dailyLimit ?? null)
    return {
      ok: true,
      userId,
      customDailyLimit: saved,
      effectiveDailyLimit: this.configService.getUserDailyLimit(userId),
    }
  }

  private async verifyAdmin(cookie: string | undefined): Promise<void> {
    const token = readCookie(cookie, SESSION_COOKIE)
    if (!token) throw new NotFoundException()
    try {
      const user = await this.identity.currentUser(token)
      if (user.role !== 'ADMIN' || user.status !== 'ACTIVE') throw new NotFoundException()
    } catch {
      throw new NotFoundException()
    }
  }
}
