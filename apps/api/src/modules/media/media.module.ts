import { Module } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module.js'
import { MediaUploadController } from './media-upload.controller.js'
import { MediaUploadService } from './media-upload.service.js'

@Module({
  imports: [IdentityModule],
  controllers: [MediaUploadController],
  providers: [MediaUploadService],
  exports: [MediaUploadService],
})
export class MediaModule {}
