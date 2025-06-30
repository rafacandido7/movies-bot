import { ApiProperty } from '@nestjs/swagger'

export class MessageDto {
  @ApiProperty({ example: '6680a8c654210085a1a1f1b2' })
  _id: string

  @ApiProperty({ example: '6680a8c654210085a1a1f1a1' })
  chatId: string

  @ApiProperty({ example: 'ia', enum: ['user', 'ia'] })
  role: 'user' | 'ia'

  @ApiProperty({ example: 'Matrix é um filme de ficção científica...' })
  content: string

  @ApiProperty()
  createdAt: Date
}
