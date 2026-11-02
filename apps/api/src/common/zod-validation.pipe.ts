/**
 * Custom ZodValidationPipe for NestJS 12.
 *
 * nestjs-zod@5.5.0 declares peerDep @nestjs/common ^10||^11 only
 * (does not declare NestJS 12 compatibility), so we use a thin custom pipe
 * instead. This resolves to the same runtime behaviour.
 */
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common'
import type { ZodSchema, ZodError } from 'zod'
import { PROBLEM_TYPES } from '@mori/contracts'

export type ZodViolation = { field: string; message: string }

function formatZodError(err: ZodError): { violations: ZodViolation[] } {
  return {
    violations: err.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    })),
  }
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: unknown): any {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException({
        type: PROBLEM_TYPES.VALIDATION,
        title: 'Validation Error',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        detail: 'The request body failed schema validation.',
        ...formatZodError(result.error),
      })
    }
    return result.data
  }
}
