import { Message } from '@domain/entities'
import { ClientSession, QueryOptions } from 'mongoose'

export abstract class MessageRepository {
  abstract create(
    messageData: Omit<Message, '_id' | 'createdAt' | 'updatedAt'>,
    session?: ClientSession,
  ): Promise<Message>
  abstract findByChatId(chatId: string): Promise<Message[]>
  abstract findMany(
    query: Record<string, any>,
    options?: QueryOptions,
  ): Promise<Message[]>
}
