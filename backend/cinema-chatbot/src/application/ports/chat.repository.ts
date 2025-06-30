import { Chat } from '@domain/entities'
import { ClientSession } from 'mongoose'

export abstract class ChatRepository {
  abstract create(
    chatData: Omit<Chat, '_id' | 'createdAt' | 'updatedAt'>,
    session?: ClientSession,
  ): Promise<Chat>
  abstract findById(id: string): Promise<Chat | null>
  abstract findAll(): Promise<Chat[]>
}
