import { describe, expect, it } from 'vitest'
import { ForbiddenException } from '@nestjs/common'
import type { CurrentUser } from '@mori/contracts'
import { assertActiveUser } from './assert-active-user.js'

describe('assertActiveUser', () => {
  it('allows active users without throwing', () => {
    const active: CurrentUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'active@mori.local',
      displayName: 'Active User',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    }
    expect(() => assertActiveUser(active)).not.toThrow()
  })

  it('rejects pending verification users with ForbiddenException', () => {
    const pending: CurrentUser = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'pending@mori.local',
      displayName: 'Pending User',
      role: 'CUSTOMER',
      status: 'PENDING_VERIFICATION',
    }
    expect(() => assertActiveUser(pending)).toThrow(ForbiddenException)
  })

  it('rejects disabled users with ForbiddenException', () => {
    const disabled: CurrentUser = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'disabled@mori.local',
      displayName: 'Disabled User',
      role: 'CUSTOMER',
      status: 'DISABLED',
    }
    expect(() => assertActiveUser(disabled)).toThrow(ForbiddenException)
  })
})
