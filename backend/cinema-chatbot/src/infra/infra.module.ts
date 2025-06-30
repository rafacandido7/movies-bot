import { Module } from '@nestjs/common'

import { EnvModule } from './env'

import { TmdbApiModule } from './tmdb-movie/tmdb-api.module'

@Module({
  imports: [EnvModule],
  providers: [],
  exports: [],
})
export class InfraModule {}
