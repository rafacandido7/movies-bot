import { Module } from '@nestjs/common'

import { InfraModule } from '@infra/infra.module'
import { DatabaseModule } from '@infra/database/database.module'

import { SendMessageUseCase, GetChatsUseCase } from '@app/use-cases'
import {
  GetCastHandler,
  GetPopularMoviesHandler,
  GetRatingHandler,
  GetRecommendationByGenreHandler,
  GetSimilarMoviesHandler,
  GetSynopsisHandler,
  OutOfScopeIntentHandler,
  UnknownIntentHandler,
} from '@app/use-cases/handlers'
import { GetMessagesByChatIdUseCase } from '@app/use-cases/get-messages-by-chatId.use-case'

import { ChatController } from './chat.controller'
import { LlmModule } from '@infra/llm/llm.module'
import { TmdbApiModule } from '@infra/tmdb-movie/tmdb-api.module'

@Module({
  imports: [InfraModule, DatabaseModule, LlmModule, TmdbApiModule],
  controllers: [ChatController],
  providers: [
    GetChatsUseCase,
    GetMessagesByChatIdUseCase,
    SendMessageUseCase,
    GetSynopsisHandler,
    GetCastHandler,
    GetRatingHandler,
    GetPopularMoviesHandler,
    GetRecommendationByGenreHandler,
    GetSimilarMoviesHandler,
    UnknownIntentHandler,
    OutOfScopeIntentHandler,
  ],
})
export class ChatModule {}
