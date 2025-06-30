import { Injectable } from '@nestjs/common'
import { ChatMessage, Intent, LlmProvider, MovieApiProvider } from '@app/ports'
import { IntentHandler } from './intent-handler'

@Injectable()
export class GetRatingHandler implements IntentHandler {
  constructor(
    private readonly movieApiProvider: MovieApiProvider,
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(intent: Intent, chatHistory: ChatMessage[]): Promise<string> {
    const movieName = intent.movieName?.trim()

    if (!movieName) {
      return 'Qual é o nome do filme que você quer saber a classificação?'
    }

    const options = await this.movieApiProvider.getMovieRating(movieName)

    if (!options || options.length === 0) {
      return `Não consegui encontrar a nota para "${movieName}". Pode verificar se o nome está correto?`
    }

    const optionsList = options
      .map(opt => `- "${opt.title}" com nota ${opt.rating.toFixed(1)}`)
      .join('\n')

    const prompt = `
Você é um assistente de cinema amigável. O usuário perguntou a nota do filme chamado "${movieName}". 

Abaixo estão algumas opções que encontrei com nomes parecidos ou relacionados:

${optionsList}

Baseado no nome exato fornecido ("${movieName}") e no histórico da conversa abaixo, escolha a opção que mais se encaixa com o que o usuário está buscando. Priorize a correspondência exata com o nome, se possível.

Histórico da conversa:
${chatHistory.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}

Explique qual é a nota do filme escolhido, comente brevemente sobre ela e responda de maneira simpática e informal, como um amigo recomendando um bom filme.
`.trim()

    return this.llmProvider.generateText(prompt)
  }
}
