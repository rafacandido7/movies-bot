import { Injectable } from '@nestjs/common'
import { ChatMessage, Intent, LlmProvider } from '@app/ports'
import { IntentHandler } from './intent-handler'

@Injectable()
export class UnknownIntentHandler implements IntentHandler {
  constructor(private readonly llmProvider: LlmProvider) {}

  async execute(intent: Intent, chatHistory: ChatMessage[]): Promise<string> {
    const chatLog = chatHistory
      .map(
        msg =>
          `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content.trim()}`,
      )
      .join('\n')

    const userAttempt = intent.movieName ?? intent.genre ?? intent.type ?? '...'

    const prompt = `
Você é um assistente amigável que não entendeu a pergunta do usuário.
Por favor, responda de forma gentil e humanizada.
Sugira ao usuário que ele pode pedir por recomendações, avaliações ou informações sobre filmes.
Incentive o usuário a reformular a pergunta ou escolher uma dessas opções.

Aqui está o histórico da conversa até agora:
${chatLog}

Usuário tentou: "${userAttempt}"

Responda:
    `

    const responseText = await this.llmProvider.generateText(prompt)

    return responseText
  }
}
