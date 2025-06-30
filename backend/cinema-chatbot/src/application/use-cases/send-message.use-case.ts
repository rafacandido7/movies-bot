import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection } from 'mongoose'

import {
  LlmProvider,
  IntentType,
  ChatMessage,
  IntentTypeEnum,
} from '@app/ports/llm.provider'
import { ChatRepository } from '@app/ports/chat.repository'
import { MessageRepository } from '@app/ports/message.repository'
import { IntentHandler } from './handlers/intent-handler'
import {
  GetCastHandler,
  GetPopularMoviesHandler,
  GetRatingHandler,
  GetRecommendationByGenreHandler,
  GetSimilarMoviesHandler,
  GetSynopsisHandler,
  OutOfScopeIntentHandler,
  UnknownIntentHandler,
} from './handlers'

export interface SendMessageUseCaseInput {
  text: string
  chatId?: string
}

export interface SendMessageUseCaseOutput {
  responseText: string
  chatId: string
}

@Injectable()
export class SendMessageUseCase {
  private readonly logger = new Logger(SendMessageUseCase.name)
  private readonly handlers: Map<IntentType, IntentHandler>

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly llmProvider: LlmProvider,
    @InjectConnection() private readonly connection: Connection,

    private readonly getSynopsisHandler: GetSynopsisHandler,
    private readonly getCastHandler: GetCastHandler,
    private readonly getRatingHandler: GetRatingHandler,
    private readonly getPopularMoviesHandler: GetPopularMoviesHandler,
    private readonly getRecommendationByGenreHandler: GetRecommendationByGenreHandler,
    private readonly getSimilarMoviesHandler: GetSimilarMoviesHandler,
    private readonly unknownHandler: UnknownIntentHandler,
    private readonly outOfScopeHandler: OutOfScopeIntentHandler,
  ) {
    this.handlers = new Map<IntentType, IntentHandler>()

    this.handlers.set(IntentTypeEnum.GetSynopsis, this.getSynopsisHandler)
    this.handlers.set(IntentTypeEnum.GetCast, this.getCastHandler)
    this.handlers.set(IntentTypeEnum.GetRating, this.getRatingHandler)
    this.handlers.set(
      IntentTypeEnum.GetPopularMovies,
      this.getPopularMoviesHandler,
    )
    this.handlers.set(
      IntentTypeEnum.GetRecommendationByGenre,
      this.getRecommendationByGenreHandler,
    )
    this.handlers.set(
      IntentTypeEnum.FindSimilarMovies,
      this.getSimilarMoviesHandler,
    )
    this.handlers.set(IntentTypeEnum.Unknown, this.unknownHandler)
    this.handlers.set(IntentTypeEnum.OutOfScope, this.outOfScopeHandler)
  }

  async execute(
    input: SendMessageUseCaseInput,
  ): Promise<SendMessageUseCaseOutput> {
    const session = await this.connection.startSession()
    this.logger.log('Iniciando transação para nova mensagem.')

    try {
      session.startTransaction()
      const { text, chatId } = input
      let resolvedChatId = chatId
      let chatHistory: ChatMessage[] = []

      if (!resolvedChatId) {
        const titlePrompt = `
            - Você vai gerar um título curto baseado na primeira mensagem que o usuário inicia uma conversa.
            - Certifique-se de que não tem mais de 80 caracteres.
            - O título deve ser um resumo da mensagem do usuário.
            - Não use aspas ou dois pontos.
            - Mensagem do usuário: "${JSON.stringify(text)}"

            - Responda em português, e apenas o título sem nenhum outro complemento.
          `
        const title = await this.llmProvider.generateText(titlePrompt)

        const newChat = await this.chatRepository.create({ title }, session)
        resolvedChatId = newChat._id
        this.logger.log(`Novo chat criado com ID: ${resolvedChatId}`)
      } else {
        this.logger.log(
          `Carregando histórico para o chat ID: ${resolvedChatId}`,
        )
        const messages = await this.messageRepository.findMany(
          { chatId: resolvedChatId },
          { sort: { createdAt: -1 }, limit: 5 },
        )

        chatHistory = messages
          .map(msg => ({
            role: msg.role,
            content: msg.content,
          }))
          .reverse()
      }

      await this.messageRepository.create(
        { chatId: resolvedChatId, role: 'user', content: text },
        session,
      )

      const intent = await this.llmProvider.analyzeIntent(text, chatHistory)

      console.log('Intent analisada:', intent)

      const handler = this.handlers.get(intent.type)

      let responseText: string

      if (handler) {
        responseText = await handler.execute(intent, chatHistory)
      } else {
        responseText = 'Desculpe, não entendi sua pergunta.'
      }

      await this.messageRepository.create(
        { chatId: resolvedChatId, role: 'ia', content: responseText },
        session,
      )

      await session.commitTransaction()
      this.logger.log('Transação commitada com sucesso.')

      return { responseText, chatId: resolvedChatId }
    } catch (error) {
      this.logger.error(
        'Erro ao processar mensagem, abortando transação.',
        error,
      )
      await session.abortTransaction()
      throw new HttpException(
        'Erro ao processar mensagem.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    } finally {
      session.endSession()
      this.logger.log('Sessão do MongoDB finalizada.')
    }
  }
}
