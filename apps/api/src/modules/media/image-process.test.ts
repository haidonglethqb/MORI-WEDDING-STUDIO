import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { processImage } from './image-process.js'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

describe('image processing', () => {
  it('drops PNG text and rejects files that are not images', () => {
    const dirty = insertText(png, 'SecretGPS')
    const cleaned = processImage(dirty)
    expect(cleaned.state).toBe('READY')
    expect(cleaned.width).toBe(1)
    expect(cleaned.height).toBe(1)
    expect(cleaned.bytes.includes(Buffer.from('SecretGPS'))).toBe(false)
    expect(cleaned.checksum).toBe(createHash('sha256').update(cleaned.bytes).digest('hex'))

    expect(processImage(Buffer.from('<html><script>alert(1)</script></html>')).state).toBe('REJECTED')
    expect(processImage(Buffer.from([0x4d, 0x5a, 0x00, 0x00])).reason).toBe('This file type is not allowed')

    const huge = rewriteSize(png, 10_000, 10_000)
    expect(processImage(huge).reason).toBe('This image is larger than 40 megapixels')
  })

  it('drops JPEG comment metadata', () => {
    const jpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8]),
      app1('Exif\0\0GPS'),
      Buffer.from([0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00]),
      Buffer.from([0xff, 0xda, 0x00, 0x02, 0x00]),
    ])
    const cleaned = processImage(jpeg)
    expect(cleaned.state).toBe('READY')
    expect(cleaned.bytes.includes(Buffer.from('GPS'))).toBe(false)
    expect(cleaned.width).toBe(1)
    expect(cleaned.height).toBe(1)
  })
})

function insertText(source: Buffer, text: string): Buffer {
  const iend = source.lastIndexOf(Buffer.from('IEND'))
  const data = Buffer.from(`Comment\0${text}`, 'latin1')
  return Buffer.concat([source.subarray(0, iend - 4), chunk('tEXt', data), source.subarray(iend - 4)])
}

function rewriteSize(source: Buffer, width: number, height: number): Buffer {
  const copy = Buffer.from(source)
  const ihdr = copy.indexOf(Buffer.from('IHDR'))
  copy.writeUInt32BE(width, ihdr + 4)
  copy.writeUInt32BE(height, ihdr + 8)
  const data = copy.subarray(ihdr, ihdr + 4 + 13)
  copy.writeUInt32BE(crc32(data), ihdr + 4 + 13)
  return copy
}

function app1(text: string): Buffer {
  const body = Buffer.from(text, 'latin1')
  const chunk = Buffer.alloc(4 + body.length)
  chunk[0] = 0xff
  chunk[1] = 0xe1
  chunk.writeUInt16BE(body.length + 2, 2)
  body.copy(chunk, 4)
  return chunk
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length)
  out.write(type, 4, 'ascii')
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff
  for (const value of bytes) {
    crc ^= value
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}
