import { MessageRepository } from '@app/ports/message.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class GetMessagesByChatIdUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(chatId: string) {
    const messages = await this.messageRepository.findByChatId(chatId)

    return messages
  }
}
