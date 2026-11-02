import { describe, expect, it } from 'vitest'
import { bifoldPanelTransforms, biFoldHingeRadians, biFoldPlacement } from './bifold-faces.js'

describe('biFoldHingeRadians', () => {
  it('closes at 0 and opens to a half turn', () => {
    expect(biFoldHingeRadians(0)).toBe(0)
    expect(biFoldHingeRadians(1)).toBe(Math.PI)
    expect(biFoldHingeRadians(0.5)).toBeCloseTo(Math.PI / 2)
    expect(() => biFoldHingeRadians(1.2)).toThrow(/between 0 and 1/)
  })
})

describe('biFoldPlacement', () => {
  it('keeps interior faces on the inside of the same panels', () => {
    expect(biFoldPlacement('exterior-front').side).toBe('out')
    expect(biFoldPlacement('interior-right').side).toBe('in')
    expect(biFoldPlacement('exterior-front').panel).toBe(biFoldPlacement('interior-right').panel)
    expect(biFoldPlacement('exterior-back').panel).not.toBe(biFoldPlacement('exterior-front').panel)
    expect(biFoldPlacement('interior-left')).not.toEqual(biFoldPlacement('exterior-front'))
  })

  it('opens the left panel and leaves the right panel unmirrored', () => {
    expect(bifoldPanelTransforms(0)).toEqual({
      left: { rotationY: 0 },
      right: { rotationY: 0 },
    })
    expect(bifoldPanelTransforms(1).left.rotationY).toBe(Math.PI)
    expect(bifoldPanelTransforms(1).right.rotationY).toBe(0)
  })
})
