import { Injectable } from '@nestjs/common'
import { ChatMessage, Intent, LlmProvider, MovieApiProvider } from '@app/ports'
import { IntentHandler } from './intent-handler'

@Injectable()
export class GetRecommendationByGenreHandler implements IntentHandler {
  constructor(
    private readonly movieApiProvider: MovieApiProvider,
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(intent: Intent, chatHistory: ChatMessage[]): Promise<string> {
    const genre = intent.genre?.trim().toLowerCase()

    if (!genre) {
      return 'Qual gênero você quer para as recomendações?'
    }

    const MAX_PAGE = 5
    const randomPage = Math.floor(Math.random() * MAX_PAGE) + 1

    const movies = await this.movieApiProvider.getRecommendationByGenre(
      genre,
      randomPage,
    )

    if (!movies || movies.length === 0) {
      return `Putz, não consegui encontrar recomendações para o gênero "${genre}". Pode tentar outro gênero?`
    }

    const selectedMovies = movies.slice(0, 3)

    const prompt = `
Você é um assistente de cinema super amigável e empolgado. Baseado no histórico da conversa e nos filmes abaixo, recomende de forma envolvente e natural alguns filmes do gênero "${genre}".

Histórico da conversa:
${chatHistory.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}

Aqui estão algumas opções legais:
${selectedMovies
  .map(
    (movie, i) =>
      `${i + 1}. "${movie.title}" (Nota: ${movie.rating.toFixed(1)}): ${movie.overview}`,
  )
  .join('\n')}

Responda em português, de forma clara, informal e divertida, e faça parecer que você escolheu essas opções especialmente para a pessoa. Evite listar demais, foque na empolgação!
    `.trim()

    return this.llmProvider.generateText(prompt)
  }
}
