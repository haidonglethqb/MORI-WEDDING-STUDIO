import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

export const DEFAULT_APP_ORIGINS = ['http://app.mori.localhost', 'http://invite.mori.localhost']

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function assertMutationOrigin(
  origin: string | undefined,
  allowed: readonly string[] = DEFAULT_APP_ORIGINS,
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
