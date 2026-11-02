export type BiFoldFace = 'exterior-front' | 'exterior-back' | 'interior-left' | 'interior-right'

export interface BiFoldPlacement {
  panel: 'left' | 'right'
  side: 'out' | 'in'
}

const PLACEMENT: Record<BiFoldFace, BiFoldPlacement> = {
  'exterior-front': { panel: 'right', side: 'out' },
  'exterior-back': { panel: 'left', side: 'out' },
  'interior-left': { panel: 'left', side: 'in' },
  'interior-right': { panel: 'right', side: 'in' },
}

/** 0 is closed. 1 is fully open. The hinge does not mirror the artwork. */
export function biFoldHingeRadians(openAmount: number): number {
  if (openAmount < 0 || openAmount > 1) {
    throw new Error('Open amount must be between 0 and 1')
  }
  return openAmount * Math.PI
}

export function biFoldPlacement(face: BiFoldFace): BiFoldPlacement {
  return PLACEMENT[face]
}

export function bifoldPanelTransforms(openAmount: number): {
  left: { rotationY: number }
  right: { rotationY: number }
} {
  return {
    left: { rotationY: biFoldHingeRadians(openAmount) },
    right: { rotationY: 0 },
  }
}
