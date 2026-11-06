import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

export const DEFAULT_APP_ORIGINS = ['http://app.mori.localhost', 'http://invite.mori.localhost']

export function getAllowedAppOrigins(): string[] {
  const list = [...DEFAULT_APP_ORIGINS]
  if (process.env['PUBLIC_APP_ORIGIN']) {
    list.push(process.env['PUBLIC_APP_ORIGIN'].trim().replace(/\/+$/, ''))
  }
  if (process.env['PUBLIC_INVITE_ORIGIN']) {
    list.push(process.env['PUBLIC_INVITE_ORIGIN'].trim().replace(/\/+$/, ''))
  }
  return list
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function assertMutationOrigin(
  origin: string | undefined,
  allowed: readonly string[] = getAllowedAppOrigins(),
): void {
  if (!origin || !allowed.includes(origin)) {
    throw new ForbiddenException({
      code: 'CROSS_SITE_REJECTED',
      message: 'This action was refused',
    })
  }
}

@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ method?: string; headers?: { origin?: string } }>()
    if (SAFE_METHODS.has(request.method ?? '')) return true
    const origin = request.headers?.origin
    assertMutationOrigin(typeof origin === 'string' ? origin : undefined)
    return true
  }
}
