import { ForbiddenException } from '@nestjs/common'
import type { CurrentUser } from '@mori/contracts'

export function assertActiveUser(user: CurrentUser): void {
  if (user.status !== 'ACTIVE') {
    throw new ForbiddenException({
      code: 'ACCOUNT_NOT_VERIFIED',
      message: 'Email verification is required to perform this action',
    })
  }
}
