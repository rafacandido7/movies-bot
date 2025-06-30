import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger'

import { GetChatsUseCase, SendMessageUseCase } from '@app/use-cases'
import { GetMessagesByChatIdUseCase } from '@app/use-cases/get-messages-by-chatId.use-case'

import { SendMessageDto } from './dto/send-message.dto'
import { ChatSummaryDto } from './dto/chat-summary.dto'
import { MessageDto } from './dto/message.dto'
import { SendMessageResponseDto } from './dto/send-message-response.dto'

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getChatsUseCase: GetChatsUseCase,
    private readonly getChatMessagesUseCase: GetMessagesByChatIdUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Enviar uma mensagem para o chatbot' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({
    status: 201,
    description: 'A mensagem foi processada com sucesso.',
    type: SendMessageResponseDto,
  })
  sendMessage(@Body() body: SendMessageDto) {
    return this.sendMessageUseCase.execute(body)
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os resumos de conversas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de resumos das conversas retornada com sucesso.',
    type: [ChatSummaryDto],
  })
  listConversations() {
    return this.getChatsUseCase.execute()
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Buscar mensagens de um chat específico' })
  @ApiParam({ name: 'id', description: 'O ID do chat', type: String })
  @ApiResponse({
    status: 200,
    description: 'Histórico de mensagens do chat retornado com sucesso.',
    type: [MessageDto],
  })
  async getMessages(@Param('id') id: string) {
    return this.getChatMessagesUseCase.execute(id)
  }
}
