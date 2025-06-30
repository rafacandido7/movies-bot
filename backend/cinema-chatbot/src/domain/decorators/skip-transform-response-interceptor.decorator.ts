import { SetMetadata } from '@nestjs/common'

export const SKIP_TRANSFORM_RESPONSE_INTERCEPTOR_KEY =
  'skipTransformResponseInterceptor'

export const SkipTransformResponseInterceptor = () =>
  SetMetadata(SKIP_TRANSFORM_RESPONSE_INTERCEPTOR_KEY, true)
