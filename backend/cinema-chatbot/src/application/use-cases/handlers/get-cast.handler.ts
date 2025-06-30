import { Injectable } from '@nestjs/common'
import { ChatMessage, Intent, LlmProvider, MovieApiProvider } from '@app/ports'
import { IntentHandler } from './intent-handler'

@Injectable()
export class GetCastHandler implements IntentHandler {
  constructor(
    private readonly movieApiProvider: MovieApiProvider,
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(intent: Intent, chatHistory: ChatMessage[]): Promise<string> {
    const movieName = intent.movieName?.trim()

    if (!movieName) {
      return 'Qual é o nome do filme que você quer saber o elenco?'
    }

    const result = await this.movieApiProvider.getMovieCast(movieName)

    if (!result?.cast || result.cast.length === 0) {
      return `Não consegui encontrar o elenco para "${movieName}". Pode verificar o nome?`
    }

    const prompt = `
Você é um assistente de cinema simpático. O usuário quer saber o elenco principal do filme "${result.title}". 
Você recebeu os nomes dos atores e os personagens que eles interpretam no original.

Histórico da conversa:
${chatHistory.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}

Atores principais:
${result.cast.map(c => `- ${c.actor} como "${c.character}"`).join('\n')}

Explique de forma clara e informal quem são os principais atores e os personagens que interpretam. 
Comente que esses são os atores originais e que, no Brasil, pode haver dubladores diferentes.
    `.trim()

    return this.llmProvider.generateText(prompt)
  }
}
