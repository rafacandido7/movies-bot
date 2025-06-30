import { Types } from 'mongoose'

import { Chat } from '@domain/entities'

import { ChatDocument } from '../schemas/chat.schema'

export class ChatMapper {
  static toEntity(document: ChatDocument): Chat {
    return new Chat(
      document._id?.toString() || '',
      document.title,
      document.createdAt,
      document.updatedAt,
    )
  }

  static toSchema(entity: Omit<Chat, '_id' | 'createdAt' | 'updatedAt'>) {
    return {
      title: entity.title,
    }
  }
}
