import { describe, expect, it } from 'vitest'
import { flatCardYaw } from './flat-card-faces.js'

describe('flatCardYaw', () => {
  it('keeps the front facing forward and turns the back halfway', () => {
    expect(flatCardYaw('front')).toBe(0)
    expect(flatCardYaw('back')).toBe(Math.PI)
    expect(flatCardYaw('back')).not.toBe(flatCardYaw('front'))
  })
})
