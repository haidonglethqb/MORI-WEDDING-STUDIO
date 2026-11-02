import { describe, expect, it } from 'vitest'
import { API_CLIENT_VERSION } from './index.js'

describe('api client', () => {
  it('exports a version marker', () => {
    expect(API_CLIENT_VERSION).toBe(1)
  })
})
