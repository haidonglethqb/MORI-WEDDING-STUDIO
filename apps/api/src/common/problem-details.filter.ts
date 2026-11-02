/**
 * Global exception filter that normalises all errors to RFC 9457 Problem
 * Details (spec section 11.5). Validation errors from ZodValidationPipe
 * include a violations array.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { PROBLEM_TYPES } from '@mori/contracts'
import type { ProblemDetails } from '@mori/contracts'

type HttpBody =
  | string
  | {
      type?: string
      title?: string
      status?: number
      detail?: string
      violations?: ProblemDetails['violations']
    }

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let problemDetails: ProblemDetails

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const body = exception.getResponse() as HttpBody

      if (typeof body === 'object' && body.type) {
        problemDetails = {
          type: body.type ?? PROBLEM_TYPES.INTERNAL,
          title: body.title ?? exception.message,
          status,
          detail: body.detail,
          instance: request.url,
          violations: body.violations,
        }
      } else {
        problemDetails = {
          type: this.typeForStatus(status),
          title: typeof body === 'string' ? body : exception.message,
          status,
          instance: request.url,
        }
      }
    } else {
      const err = exception instanceof Error ? exception : new Error(String(exception))
      this.logger.error(`Unhandled exception: ${err.message}`, err.stack)
      problemDetails = {
        type: PROBLEM_TYPES.INTERNAL,
        title: 'Internal Server Error',
        status,
        instance: request.url,
      }
    }

    response
      .status(status)
      .setHeader('Content-Type', 'application/problem+json')
      .json(problemDetails)
  }

  private typeForStatus(status: number): string {
    switch (status) {
      case 404:
        return PROBLEM_TYPES.NOT_FOUND
      case 409:
        return PROBLEM_TYPES.CONFLICT
      case 422:
      case 400:
        return PROBLEM_TYPES.VALIDATION
      default:
        return PROBLEM_TYPES.INTERNAL
    }
  }
}
