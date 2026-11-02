import { Module } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module.js'
import { CustomerRequestsController } from './customer-requests.controller.js'
import { CustomerRequestsService } from './customer-requests.service.js'
import { RequestMessagesService } from './request-messages.service.js'
import { StudioAssignController } from './studio-assign.controller.js'
import { ProofOpenService } from './proof-open.service.js'
import { ProofService } from './proof.service.js'
import { StudioAssignService } from './studio-assign.service.js'
import { StudioProofController } from './studio-proof.controller.js'
import { StudioQueueController } from './studio-queue.controller.js'
import { StudioQueueService } from './studio-queue.service.js'

@Module({
  imports: [IdentityModule],
  controllers: [StudioQueueController, CustomerRequestsController, StudioAssignController, StudioProofController],
  providers: [
    StudioQueueService,
    RequestMessagesService,
    CustomerRequestsService,
    StudioAssignService,
    ProofService,
    ProofOpenService,
  ],
})
export class DesignModule {}
