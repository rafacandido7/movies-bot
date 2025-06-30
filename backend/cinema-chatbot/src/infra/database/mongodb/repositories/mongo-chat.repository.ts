import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, ClientSession, QueryOptions, ProjectionType } from 'mongoose'

import { Chat } from '@domain/entities'
import { ChatRepository } from '@app/ports/chat.repository'

import { ChatMapper } from '../mappers/chat.mapper'
import { ChatDocument } from '../schemas/chat.schema'

@Injectable()
export class MongoChatRepository implements ChatRepository {
  constructor(
    @InjectModel('Chat') private readonly chatModel: Model<ChatDocument>,
  ) {}

  async create(
    chatData: Omit<Chat, '_id' | 'createdAt' | 'updatedAt'>,
    session: ClientSession | null = null,
  ): Promise<Chat> {
    const createdChat = new this.chatModel(ChatMapper.toSchema(chatData))
    const savedChat = await createdChat.save({ session })

    return ChatMapper.toEntity(savedChat)
  }

  async findById(
    id: string,
    projection?: ProjectionType<Chat>,
  ): Promise<Chat | null> {
    const chat = await this.chatModel.findOne({ _id: id }, projection).lean()

    return chat ? ChatMapper.toEntity(chat) : null
  }

  async findAll(
    projection?: ProjectionType<Chat>,
    options?: QueryOptions,
  ): Promise<Chat[]> {
    const chats = await this.chatModel
      .find({}, projection, options)
      .sort({ createdAt: -1 })
      .lean()

    return chats.map(ChatMapper.toEntity)
  }
}
