import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class MediaDeleteService {
  async delete(ownerUserId: string, assetId: string): Promise<void> {
    const prisma = getPrismaClient()
    const asset = await prisma.mediaAsset.findFirst({ where: { id: assetId, ownerUserId } })
    if (!asset) throw new NotFoundException()
    const published = await prisma.$queryRaw<{ id: string }[]>`
      SELECT r.id
      FROM invitation_revisions r
      JOIN invitations i ON i."publishedRevisionId" = r.id
      WHERE i.status = 'PUBLISHED'
        AND r.payload->>'coverAssetId' = ${assetId}
    `
    if (published[0]) {
      throw new ConflictException({ code: 'ASSET_IN_USE', message: 'This file is used by a published invitation' })
    }
    const protectedProof = await prisma.designRevision.findFirst({
      where: { mediaAssetId: assetId, state: { in: ['IN_REVIEW', 'APPROVED'] } },
    })
    if (protectedProof) {
      throw new ConflictException({ code: 'ASSET_IN_USE', message: 'This file is used by a proof' })
    }
    await prisma.$transaction(async (tx) => {
      await tx.designRevision.updateMany({
        where: { mediaAssetId: assetId, state: 'WORKING' },
        data: { mediaAssetId: null },
      })
      await tx.mediaAsset.delete({ where: { id: assetId } })
    })
  }
}
