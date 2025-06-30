import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, QueryOptions, Types } from 'mongoose'

import { Message } from '@domain/entities'
import { MessageRepository } from '@app/ports/message.repository'

import { MessageMapper } from '../mappers/message.mapper'
import { MessageDocument } from '../schemas/message.schema'

@Injectable()
export class MongoMessageRepository implements MessageRepository {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async create(
    messageData: Omit<Message, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Message> {
    const messageToSave = MessageMapper.toSchema(messageData)

    const createdMessage = new this.messageModel(messageToSave)

    const savedMessage = await createdMessage.save()

    return MessageMapper.toEntity(savedMessage)
  }

  async findByChatId(
    chatId: string,
    options?: QueryOptions,
  ): Promise<Message[]> {
    const messages = await this.messageModel
      .find({ chatId: new Types.ObjectId(chatId) }, null, options)
      .sort({ createdAt: 1 })
      .lean()

    return messages.map(MessageMapper.toEntity)
  }

  async findMany(
    query: Record<string, any>,
    options?: QueryOptions,
  ): Promise<Message[]> {
    const messages = await this.messageModel.find(query, null, options).lean()

    return messages.map(MessageMapper.toEntity)
  }
}
