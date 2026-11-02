import { createHash } from 'node:crypto'

const MAX_PIXELS = 40_000_000

export interface ProcessedImage {
  state: 'READY' | 'REJECTED'
  reason: string | null
  bytes: Buffer
  checksum: string
  width: number
  height: number
}

export function processImage(bytes: Buffer): ProcessedImage {
  const blocked = blockedReason(bytes)
  if (blocked) return rejected(bytes, blocked)
  if (isPng(bytes)) return finishPng(bytes)
  if (isJpeg(bytes)) return finishJpeg(bytes)
  if (isWebp(bytes)) return accepted(bytes, 0, 0)
  return rejected(bytes, 'This file is not an allowed image')
}

function finishPng(bytes: Buffer): ProcessedImage {
  const chunks = readPng(bytes)
  if (!chunks) return rejected(bytes, 'This PNG could not be read')
  const header = chunks.find((chunk) => chunk.type === 'IHDR')
  if (!header || header.data.length < 8) return rejected(bytes, 'This PNG could not be read')
  const width = header.data.readUInt32BE(0)
  const height = header.data.readUInt32BE(4)
  if (width < 1 || height < 1 || width * height > MAX_PIXELS) {
    return rejected(bytes, 'This image is larger than 40 megapixels')
  }
  const kept = chunks.filter((chunk) => !['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME'].includes(chunk.type))
  return accepted(writePng(kept), width, height)
}

function finishJpeg(bytes: Buffer): ProcessedImage {
  const stripped = stripJpeg(bytes)
  const size = jpegSize(stripped)
  if (!size) return rejected(bytes, 'This JPEG could not be read')
  if (size.width * size.height > MAX_PIXELS) return rejected(bytes, 'This image is larger than 40 megapixels')
  return accepted(stripped, size.width, size.height)
}

function blockedReason(bytes: Buffer): string | null {
  const head = bytes.subarray(0, 64).toString('utf8').trimStart().toLowerCase()
  if (head.startsWith('<svg') || head.includes('<html') || head.startsWith('<!doctype html')) {
    return 'This file type is not allowed'
  }
  if (bytes.length >= 2 && bytes[0] === 0x4d && bytes[1] === 0x5a) return 'This file type is not allowed'
  if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b) return 'This file type is not allowed'
  return null
}

function accepted(bytes: Buffer, width: number, height: number): ProcessedImage {
  return { state: 'READY', reason: null, bytes, checksum: sha(bytes), width, height }
}

function rejected(bytes: Buffer, reason: string): ProcessedImage {
  return { state: 'REJECTED', reason, bytes, checksum: sha(bytes), width: 0, height: 0 }
}

function sha(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function isPng(bytes: Buffer): boolean {
  return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
}

function isJpeg(bytes: Buffer): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
}

function isWebp(bytes: Buffer): boolean {
  return bytes.length >= 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP'
}

interface PngChunk {
  type: string
  data: Buffer
}

function readPng(bytes: Buffer): PngChunk[] | null {
  const chunks: PngChunk[] = []
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset)
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii')
    const start = offset + 8
    const end = start + length
    if (end + 4 > bytes.length) return null
    chunks.push({ type, data: Buffer.from(bytes.subarray(start, end)) })
    offset = end + 4
    if (type === 'IEND') return chunks
  }
  return null
}

function writePng(chunks: PngChunk[]): Buffer {
  const parts = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])]
  for (const chunk of chunks) {
    const type = Buffer.from(chunk.type, 'ascii')
    const length = Buffer.alloc(4)
    length.writeUInt32BE(chunk.data.length)
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(Buffer.concat([type, Buffer.from(chunk.data)])))
    parts.push(length, type, Buffer.from(chunk.data), crc)
  }
  return Buffer.concat(parts)
}

function stripJpeg(bytes: Buffer): Buffer {
  const parts: Buffer[] = [bytes.subarray(0, 2)]
  let offset = 2
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break
    const marker = bytes[offset + 1] ?? 0
    if (marker === 0xda) {
      parts.push(bytes.subarray(offset))
      return Buffer.concat(parts)
    }
    const size = bytes.readUInt16BE(offset + 2)
    const next = offset + 2 + size
    if (next > bytes.length) break
    const drop = marker === 0xe1 || marker === 0xfe
    if (!drop) parts.push(bytes.subarray(offset, next))
    offset = next
  }
  return Buffer.concat(parts)
}

function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  let offset = 2
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null
    const marker = bytes[offset + 1] ?? 0
    if (marker === 0xda) return null
    const size = bytes.readUInt16BE(offset + 2)
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) }
    }
    offset += 2 + size
  }
  return null
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const value of bytes) {
    crc ^= value
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}
