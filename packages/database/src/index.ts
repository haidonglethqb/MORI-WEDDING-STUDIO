export {
  createPrismaClient,
  getPrismaClient,
  disconnectPrismaClient,
} from './client.js'
export type { PrismaClientOptions } from './client.js'
export { claimNotificationTasks } from './notification-tasks.js'
// Re-export Prisma Client types for consumers
export { PrismaClient, Prisma } from '@prisma/client'
