import { Injectable } from '@nestjs/common'
import { ChatMessage, Intent, LlmProvider, MovieApiProvider } from '@app/ports'
import { IntentHandler } from './intent-handler'

@Injectable()
export class GetSimilarMoviesHandler implements IntentHandler {
  constructor(
    private readonly movieApiProvider: MovieApiProvider,
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(intent: Intent, chatHistory: ChatMessage[]): Promise<string> {
    const movieName = intent.movieName?.trim()

    if (!movieName) {
      return 'Qual filme você quer que eu encontre filmes similares?'
    }

    const similarMovies =
      await this.movieApiProvider.findSimilarMovies(movieName)

    if (!similarMovies || similarMovies.length === 0) {
      return `Não encontrei filmes similares para "${movieName}".`
    }

    const topSimilar = similarMovies.slice(0, 7)

    const prompt = `
Você é um assistente de cinema amigável e animado. Com base no histórico da conversa e nos filmes similares listados abaixo, recomende filmes parecidos com "${movieName}". Seja acolhedor e natural.

Histórico da conversa:
${chatHistory.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}

Aqui estão alguns filmes similares que você pode gostar:
${topSimilar
  .map(
    (movie, i) =>
      `${i + 1}. "${movie.title}" (Nota: ${movie.rating.toFixed(1)}): ${movie.overview}`,
  )
  .join('\n')}

Se quiser mais opções, é só pedir!
    `.trim()

    return this.llmProvider.generateText(prompt)
  }
}
