import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { MovieApiProvider } from '@app/ports'

import { EnvModule, EnvService } from '@infra/env'
import { TmdbMovieApiProvider } from './tmdb-api.provider'

@Module({
  imports: [
    EnvModule,
    HttpModule.registerAsync({
      imports: [EnvModule],
      useFactory: (envService: EnvService) => ({
        baseURL: envService.get('TMDB_BASE_URL'),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${envService.get('TMDB_READ_ACCESS_KEY')}`,
        },
      }),
      inject: [EnvService],
    }),
  ],
  providers: [
    {
      provide: MovieApiProvider,
      useClass: TmdbMovieApiProvider,
    },
  ],
  exports: [MovieApiProvider],
})
export class TmdbApiModule {}
