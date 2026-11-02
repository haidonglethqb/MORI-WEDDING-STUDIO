import { describe, expect, it } from 'vitest'
import { productionBlockReason } from './production-preflight.js'

const ready = {
  approvedHash: 'hash-2',
  fileHash: 'hash-2',
  trimWidthMm: 100,
  trimHeightMm: 150,
  profileWidthMm: 100,
  profileHeightMm: 150,
  fontsReady: true,
}

describe('productionBlockReason', () => {
  it('allows a matching approved file and blocks a wrong trim', () => {
    expect(productionBlockReason(ready)).toBeNull()
    expect(productionBlockReason({ ...ready, fileHash: 'hash-3' })).toMatch(/does not match/)
    expect(productionBlockReason({ ...ready, trimWidthMm: 90 })).toMatch(/Trim size does not match/)
    expect(productionBlockReason({ ...ready, trimHeightMm: null })).toMatch(/Trim size is missing/)
    expect(productionBlockReason({ ...ready, fontsReady: false })).toMatch(/Font requirements are missing/)
  })
})
