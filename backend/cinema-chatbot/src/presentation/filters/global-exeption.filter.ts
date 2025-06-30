import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let errorMessage = 'Internal server error'
    let errorName = 'InternalServerError'

    if (exception instanceof HttpException) {
      status = exception.getStatus()

      const res = exception.getResponse()
      if (typeof res === 'string') {
        errorMessage = res
        errorName = HttpStatus[status] || 'Error'
      } else if (typeof res === 'object' && res !== null) {
        const resp = res as any
        errorMessage = resp.message ?? 'Erro desconhecido'
        errorName = resp.error ?? (HttpStatus[status] || 'Error')
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.BAD_REQUEST
      errorMessage = exception.message
      errorName = 'BadRequest'
    }

    const errorResponse = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      error: {
        message: errorMessage,
        error: errorName,
        statusCode: status,
      },
    }

    this.logger.error(
      `[${status}] ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    )

    response.status(status).json(errorResponse)
  }
}
