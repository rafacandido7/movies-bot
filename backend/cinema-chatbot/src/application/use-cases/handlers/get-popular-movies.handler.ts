import { Injectable } from '@nestjs/common'
import { ChatMessage, Intent, LlmProvider, MovieApiProvider } from '@app/ports'
import { IntentHandler } from './intent-handler'

@Injectable()
export class GetPopularMoviesHandler implements IntentHandler {
  constructor(
    private readonly movieApiProvider: MovieApiProvider,
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(intent: Intent, chatHistory: ChatMessage[]): Promise<string> {
    const movies = await this.movieApiProvider.getPopularMovies()

    if (!movies || movies.length === 0) {
      return 'Não consegui encontrar filmes populares no momento. Tente novamente mais tarde!'
    }

    const prompt = `
Você é um assistente de cinema simpático e atualizado. Abaixo está a lista dos filmes mais populares do momento.

Histórico da conversa:
${chatHistory.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}

Filmes populares:
${movies.map((m, i) => `${i + 1}. ${m.title} (Nota: ${m.rating}) - ${m.overview}`).join('\n')}

Com base nesses dados, diga ao usuário de forma descontraída quais são os filmes mais assistidos atualmente. Fale em português, com uma linguagem informal e acolhedora.
    `.trim()

    return this.llmProvider.generateText(prompt)
  }
}
