import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Chat' })
  chatId: string

  @Prop({
    required: true,
    enum: ['user', 'ia'],
    type: MongooseSchema.Types.String,
  })
  role: 'user' | 'ia'

  @Prop({ required: true, type: MongooseSchema.Types.String })
  content: string
}

export const MessageSchema = SchemaFactory.createForClass(Message)

MessageSchema.index({ createdAt: 1 })
MessageSchema.index({ chatId: 1 })
MessageSchema.index({ chatId: 1, createdAt: -1 })

export type MessageDocument = Document &
  Message & {
    createdAt: Date
    updatedAt: Date
  }
