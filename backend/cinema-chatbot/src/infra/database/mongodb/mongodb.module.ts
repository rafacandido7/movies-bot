import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { EnvModule, EnvService } from '@infra/env'

import { MongoChatRepository, MongoMessageRepository } from './repositories'
import { Chat, ChatSchema, Message, MessageSchema } from './schemas'
import { ChatRepository } from '@app/ports/chat.repository'
import { MessageRepository } from '@app/ports/message.repository'

@Module({
  imports: [
    EnvModule,
    MongooseModule.forRootAsync({
      imports: [EnvModule],
      useFactory: (envService: EnvService) => ({
        uri: envService.get('DATABASE_URL'),
        dbName: envService.get('DATABASE_NAME'),
      }),
      inject: [EnvService],
    }),
    MongooseModule.forFeature([
      {
        name: Chat.name,
        schema: ChatSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  providers: [
    EnvService,
    {
      provide: ChatRepository,
      useClass: MongoChatRepository,
    },
    {
      provide: MessageRepository,
      useClass: MongoMessageRepository,
    },
  ],
  exports: [MongooseModule, ChatRepository, MessageRepository],
})
export class MongoDbModule {}
