import { ApiProperty } from '@nestjs/swagger'

export class SendMessageResponseDto {
  @ApiProperty({ example: 'Matrix é um filme de ficção científica...' })
  responseText: string

  @ApiProperty({ example: '6680a8c654210085a1a1f1a1' })
  chatId: string
}
