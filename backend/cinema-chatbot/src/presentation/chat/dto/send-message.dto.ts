import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class SendMessageDto {
  @ApiProperty({
    description: 'O texto da mensagem enviada pelo usuário.',
    example: 'qual a sinopse de Matrix?',
  })
  @IsString()
  @IsNotEmpty()
  text: string

  @ApiProperty({
    description:
      'O ID do chat existente (opcional). Se não for enviado, um novo chat será criado.',
    example: '6680b5e8a7a7a1b1c1d1e1f1',
    required: false,
  })
  @IsOptional()
  chatId?: string
}
