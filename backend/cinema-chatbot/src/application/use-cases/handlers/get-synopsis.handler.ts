import { Injectable } from '@nestjs/common'
import { ChatMessage, Intent, LlmProvider, MovieApiProvider } from '@app/ports'
import { IntentHandler } from './intent-handler'

@Injectable()
export class GetSynopsisHandler implements IntentHandler {
  constructor(
    private readonly movieApiProvider: MovieApiProvider,
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(intent: Intent, chatHistory: ChatMessage[]): Promise<string> {
    const movieName = intent.movieName?.trim()

    if (!movieName) {
      return 'Não consegui identificar o nome do filme na sua pergunta. Você poderia reformular?'
    }

    const movies = await this.movieApiProvider.searchMovies(movieName)

    if (!movies || movies.length === 0) {
      return `Não consegui encontrar nenhum filme com o nome "${movieName}". Você pode verificar se escreveu corretamente?`
    }

    const prompt = `
Você é um assistente de cinema amigável. Sua missão é ajudar o usuário com base no histórico da conversa e nas sinopses abaixo.

Histórico da conversa:
${chatHistory.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}

O usuário está pedindo a sinopse de um filme chamado "${movieName}".

Aqui estão algumas opções encontradas:
${movies
  .map((movie, index) =>
    `
[${index + 1}] Título: "${movie.title}"
Sinopse: "${movie.overview}"
Nota média: ${movie.rating}
`.trim(),
  )
  .join('\n\n')}

Escolha a opção mais apropriada com base na conversa e responda de forma natural, clara e acolhedora.
Não copie literalmente a sinopse — reescreva com um toque humano.
Se o usuário demonstrou expectativa, leve isso em consideração.
    `.trim()

    return this.llmProvider.generateText(prompt)
  }
}
