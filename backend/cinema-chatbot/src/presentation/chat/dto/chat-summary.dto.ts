import { ApiProperty } from '@nestjs/swagger'

export class ChatSummaryDto {
  @ApiProperty({ example: '6680a8c654210085a1a1f1a1' })
  _id: string

  @ApiProperty({ example: 'Sinopse do filme Matrix' })
  title: string

  @ApiProperty()
  createdAt: Date
}
