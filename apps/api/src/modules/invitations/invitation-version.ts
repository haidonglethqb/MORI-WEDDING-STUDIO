import { createHash } from 'node:crypto'
import { ConflictException } from '@nestjs/common'

export function hashContent(content: unknown): string {
  return createHash('sha256').update(JSON.stringify(content)).digest('hex')
}

export function versionConflict(): ConflictException {
  return new ConflictException({
    type: 'urn:mori:problem:version-conflict',
    title: 'This invitation has changed',
    status: 409,
    detail: 'Reload the latest version before applying your changes.',
  })
}
