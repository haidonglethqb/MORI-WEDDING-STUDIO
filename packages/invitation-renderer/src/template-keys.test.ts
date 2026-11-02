import { describe, expect, it } from 'vitest'
import { templateFamilies } from './template-keys.js'

describe('templateFamilies', () => {
  it('lists the three launch families', () => {
    expect(templateFamilies).toHaveLength(3)
  })
})
