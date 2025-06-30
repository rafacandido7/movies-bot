import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    type: MongooseSchema.Types.String,
    trim: true,
    default: 'Untitled Chat',
  })
  title: string
}

export const ChatSchema = SchemaFactory.createForClass(Chat)

ChatSchema.index({ createdAt: 1 })
ChatSchema.index({ updatedAt: 1 })

export type ChatDocument = Document &
  Chat & {
    createdAt: Date
    updatedAt: Date
  }
