import { Module } from '@nestjs/common'
import { TaskWorkerService } from './task-worker.service.js'

@Module({
  providers: [TaskWorkerService],
  exports: [TaskWorkerService],
})
export class WorkerModule {}
