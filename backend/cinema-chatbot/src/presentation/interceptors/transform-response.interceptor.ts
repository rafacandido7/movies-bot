import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SKIP_TRANSFORM_RESPONSE_INTERCEPTOR_KEY } from '@domain/decorators/skip-transform-response-interceptor.decorator'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const skip = this.reflector.get<boolean>(
      SKIP_TRANSFORM_RESPONSE_INTERCEPTOR_KEY,
      context.getHandler(),
    )

    if (skip) {
      return next.handle()
    }

    return next.handle().pipe(
      map(res => {
        if (!res) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            data: null,
          }
        }

        if (res.stream) {
          return res
        }

        if (res.data) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            ...res,
            data: res.data,
          }
        }

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data: res,
        }
      }),
    )
  }
}
