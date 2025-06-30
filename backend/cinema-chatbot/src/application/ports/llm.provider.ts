import { BedrockModelId } from '@domain/consts'

export type IntentType =
  | 'get_synopsis'
  | 'get_cast'
  | 'get_rating'
  | 'get_popular_movies'
  | 'get_recommendation_by_genre'
  | 'get_similar_movies'
  | 'unknown'
  | 'out_of_scope'

export enum IntentTypeEnum {
  GetSynopsis = 'get_synopsis',
  GetCast = 'get_cast',
  GetRating = 'get_rating',
  GetPopularMovies = 'get_popular_movies',
  FindSimilarMovies = 'get_similar_movies',
  GetRecommendationByGenre = 'get_recommendation_by_genre',
  Unknown = 'unknown',
  OutOfScope = 'out_of_scope',
}

export type Intent = {
  type: IntentType
  movieName?: string
  genre?: string
}

export type ChatMessage = {
  role: 'user' | 'ia'
  content: string
}

export abstract class LlmProvider {
  abstract analyzeIntent(text: string, history: ChatMessage[]): Promise<Intent>
  abstract generateText(
    prompt: string,
    modelId?: BedrockModelId,
  ): Promise<string>
}
