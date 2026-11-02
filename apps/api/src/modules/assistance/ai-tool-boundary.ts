import { ForbiddenException, Injectable } from '@nestjs/common'

const READ_ONLY_TOOLS = new Set(['read-catalogue'])

export interface AiToolResult {
  allowed: true
  provider: 'DISABLED'
  tool: 'read-catalogue'
}

@Injectable()
export class AiToolBoundary {
  run(tool: string): AiToolResult {
    if (!READ_ONLY_TOOLS.has(tool)) {
      throw new ForbiddenException({
        code: 'AI_TOOL_DENIED',
        message: 'This action is not available to the assistant',
      })
    }
    return { allowed: true, provider: 'DISABLED', tool: 'read-catalogue' }
  }
}
