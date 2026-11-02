import { describe, expect, it } from 'vitest'
import { colorTokens } from './tokens.js'

describe('colorTokens', () => {
  it('keeps olive as the primary action colour', () => {
    expect(colorTokens.actionPrimary).toBe(colorTokens.moriOlive)
  })
})
