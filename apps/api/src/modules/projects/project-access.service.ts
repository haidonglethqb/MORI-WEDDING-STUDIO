import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

export interface ProjectView {
  id: string
  internalTitle: string
}

@Injectable()
export class ProjectAccessService {
  async read(actorUserId: string, projectId: string): Promise<ProjectView> {
    const project = await getPrismaClient().weddingProject.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerUserId: actorUserId },
          { assignments: { some: { staffUserId: actorUserId, revokedAt: null } } },
        ],
      },
    })
    if (!project) throw new NotFoundException()
    return { id: project.id, internalTitle: project.internalTitle }
  }
}
