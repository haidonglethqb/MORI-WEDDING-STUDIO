import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { ConflictException } from '@nestjs/common'

export function writeImmutable(assetId: string, checksum: string, bytes: Buffer): string {
  const key = `final/${assetId}/${checksum}`
  const path = join(mediaRoot(), key)
  mkdirSync(dirname(path), { recursive: true })
  if (existsSync(path)) {
    const current = readFileSync(path)
    if (!current.equals(bytes)) throw new ConflictException('A finished upload cannot be replaced')
    return key
  }
  writeFileSync(path, bytes)
  return key
}

export function readImmutable(storageKey: string): Buffer {
  return readFileSync(join(mediaRoot(), storageKey))
}

function mediaRoot(): string {
  return process.env['MEDIA_ROOT'] ?? join(process.cwd(), '.data', 'media')
}

export function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}
