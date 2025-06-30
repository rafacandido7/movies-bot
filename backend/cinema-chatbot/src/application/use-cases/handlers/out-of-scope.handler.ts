import { Injectable } from '@nestjs/common'
import { ChatMessage, Intent, LlmProvider } from '@app/ports'
import { IntentHandler } from './intent-handler'

@Injectable()
export class OutOfScopeIntentHandler implements IntentHandler {
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
Você é um assistente amigável que percebeu que o pedido do usuário está fora do escopo do que você pode ajudar.
Por favor, responda de forma gentil e educada.
Informe que você não consegue ajudar com esse pedido, mas sugira que o usuário pode pedir por recomendações, avaliações ou informações sobre filmes.
Incentive o usuário a fazer outro pedido dentro do escopo.

Aqui está o histórico da conversa até agora:
${chatLog}

Pedido fora do escopo do sistema: "${userAttempt}"

Responda:
    `

    const responseText = await this.llmProvider.generateText(prompt)

    return responseText
  }
}
