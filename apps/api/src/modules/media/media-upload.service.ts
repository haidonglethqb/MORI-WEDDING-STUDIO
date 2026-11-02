import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { processImage } from './image-process.js'
import { writeImmutable } from './media-store.js'

const MAX_FILE_BYTES = 10_485_760
const MAX_QUOTA_BYTES = 262_144_000
const PURPOSES = new Set(['cover', 'gallery', 'reference'])
const MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export interface OpenUpload {
  uploadId: string
  stagingKey: string
  expectedBytes: number
  expiresAt: string
}

@Injectable()
export class MediaUploadService {
  async open(input: {
    ownerUserId: string
    projectId: string
    purpose: string
    expectedBytes: number
    declaredMime: string
    idempotencyKey: string
  }): Promise<OpenUpload> {
    if (!PURPOSES.has(input.purpose) || !MIMES.has(input.declaredMime)) {
      throw new UnprocessableEntityException('This upload needs an allowed purpose and image type')
    }
    if (!Number.isInteger(input.expectedBytes) || input.expectedBytes < 1 || input.expectedBytes > MAX_FILE_BYTES) {
      throw new UnprocessableEntityException('This image must be between 1 byte and 10 MB')
    }
    const key = input.idempotencyKey.trim()
    if (key.length < 1 || key.length > 80) {
      throw new UnprocessableEntityException('This command needs an idempotency key')
    }
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${input.ownerUserId}::uuid FOR UPDATE`
      const project = await tx.weddingProject.findFirst({
        where: { id: input.projectId, ownerUserId: input.ownerUserId },
      })
      if (!project) throw new NotFoundException()
      const replay = await tx.idempotencyRecord.findUnique({
        where: { principalId_command_key: { principalId: input.ownerUserId, command: 'open-media-upload', key } },
      })
      if (replay) {
        if (replay.requestHash !== requestHash(input)) {
          throw new UnprocessableEntityException('This idempotency key was already used')
        }
        const existing = await tx.mediaUploadSession.findFirst({
          where: { id: replay.resourceId, ownerUserId: input.ownerUserId },
        })
        if (existing) return toOpen(existing)
      }
      const reserved = await reservedBytes(tx, input.ownerUserId)
      if (reserved + input.expectedBytes > MAX_QUOTA_BYTES) throw new ConflictException('The media quota is full')
      const session = await tx.mediaUploadSession.create({
        data: {
          ownerUserId: input.ownerUserId,
          projectId: input.projectId,
          purpose: input.purpose,
          stagingKey: randomBytes(32).toString('hex'),
          expectedBytes: input.expectedBytes,
          declaredMime: input.declaredMime,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.ownerUserId,
          command: 'open-media-upload',
          key,
          requestHash: requestHash(input),
          resourceId: session.id,
        },
      })
      return toOpen(session)
    })
  }

  async complete(ownerUserId: string, uploadId: string, bytes: Buffer): Promise<{ assetId: string; checksum: string }> {
    const prisma = getPrismaClient()
    const session = await prisma.mediaUploadSession.findFirst({
      where: { id: uploadId, ownerUserId },
      include: { asset: true },
    })
    if (!session) throw new NotFoundException()
    const checksum = createHash('sha256').update(bytes).digest('hex')
    if (session.completedAt && session.asset) {
      if (session.asset.checksum === checksum && Number(session.asset.byteSize) === bytes.length) {
        return { assetId: session.asset.id, checksum }
      }
      throw new ConflictException('A finished upload cannot be replaced')
    }
    if (session.expiresAt.getTime() <= Date.now()) throw new ConflictException('This upload session has expired')
    if (bytes.length !== session.expectedBytes || sniff(bytes) !== session.declaredMime) {
      throw new ConflictException('The uploaded bytes do not match this session')
    }
    const processed = processImage(bytes)
    const assetId = randomUUID()
    const storageKey =
      processed.state === 'READY' ? writeImmutable(assetId, processed.checksum, processed.bytes) : null
    const asset = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM media_upload_sessions WHERE id = ${uploadId}::uuid FOR UPDATE`
      const current = await tx.mediaUploadSession.findFirst({ where: { id: uploadId, completedAt: null } })
      if (!current) throw new ConflictException('A finished upload cannot be replaced')
      const reserved = await reservedBytes(tx, ownerUserId)
      if (reserved > MAX_QUOTA_BYTES) throw new ConflictException('The media quota is full')
      const created = await tx.mediaAsset.create({
        data: {
          id: assetId,
          ownerUserId,
          projectId: session.projectId,
          purpose: session.purpose,
          checksum,
          byteSize: BigInt(bytes.length),
          state: processed.state,
        },
      })
      if (storageKey) {
        await tx.mediaDerivative.create({
          data: {
            assetId,
            profile: 'full',
            storageKey,
            checksum: processed.checksum,
            width: processed.width,
            height: processed.height,
          },
        })
      }
      await tx.mediaUploadSession.update({
        where: { id: uploadId },
        data: { completedAt: new Date(), assetId: created.id },
      })
      return created
    })
    return { assetId: asset.id, checksum }
  }

  async assertAttachable(ownerUserId: string, assetId: string, projectId: string): Promise<void> {
    const asset = await getPrismaClient().mediaAsset.findFirst({
      where: { id: assetId, ownerUserId, projectId, state: 'READY' },
    })
    if (!asset) throw new NotFoundException()
  }
}

function requestHash(input: { projectId: string; purpose: string; expectedBytes: number; declaredMime: string }): string {
  return `${input.projectId}:${input.purpose}:${input.expectedBytes}:${input.declaredMime}`
}

async function reservedBytes(tx: { $queryRaw: Function }, ownerUserId: string): Promise<number> {
  const assets = await tx.$queryRaw`
    SELECT COALESCE(SUM("byteSize"), 0) AS total
    FROM media_assets
    WHERE "ownerUserId" = ${ownerUserId}::uuid
  `
  const sessions = await tx.$queryRaw`
    SELECT COALESCE(SUM("expectedBytes"), 0) AS total
    FROM media_upload_sessions
    WHERE "ownerUserId" = ${ownerUserId}::uuid
      AND "completedAt" IS NULL
      AND "expiresAt" > NOW()
  `
  return Number(readTotal(assets)) + Number(readTotal(sessions))
}

function readTotal(rows: unknown): bigint {
  const first = Array.isArray(rows) ? (rows[0] as { total?: bigint } | undefined) : undefined
  return first?.total ?? 0n
}

function sniff(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png'
  }
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') {
    return 'image/webp'
  }
  return null
}

function toOpen(session: { id: string; stagingKey: string; expectedBytes: number; expiresAt: Date }): OpenUpload {
  return {
    uploadId: session.id,
    stagingKey: session.stagingKey,
    expectedBytes: session.expectedBytes,
    expiresAt: session.expiresAt.toISOString(),
  }
}

