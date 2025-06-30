import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request: Request = context.switchToHttp().getRequest()

    const { body, method, url } = request
    this.logger.verbose(`>>> ${method} ${url} ${JSON.stringify(body || {})}`)
    const date = Date.now()
    return next.handle().pipe(
      tap((response) => {
        const message =
          JSON.stringify(response || {})?.length > 5000
            ? `<<< ${method} ${url} ${Date.now() - date} ${JSON.stringify(
                response || {},
              ).substring(0, 10000)} - response cutted`
            : `<<< ${method} ${url} ${Date.now() - date} ${JSON.stringify(
                response || {},
              )}`

        this.logger.debug(message)
      }),
    )
  }
}
