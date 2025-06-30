import { Types } from 'mongoose'

import { MessageDocument } from '../schemas/message.schema'
import { Message } from '@domain/entities'

export class MessageMapper {
  static toEntity(document: MessageDocument): Message {
    return new Message(
      document._id?.toString() || '',
      document.chatId.toString(),
      document.role,
      document.content,
      document.createdAt,
      document.updatedAt,
    )
  }

  static toSchema(entity: Omit<Message, '_id' | 'createdAt' | 'updatedAt'>) {
    return {
      chatId: new Types.ObjectId(entity.chatId),
      role: entity.role,
      content: entity.content,
    }
  }
}
