import { Injectable } from '@nestjs/common'

import { ChatRepository } from '@app/ports/chat.repository'

@Injectable()
export class GetChatsUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute() {
    const chats = await this.chatRepository.findAll()

    return chats
  }
}
