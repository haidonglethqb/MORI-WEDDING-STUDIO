import { Module } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module.js'
import { NotificationController } from './notification.controller.js'
import { NotificationService } from './notification.service.js'

@Module({
  imports: [IdentityModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
