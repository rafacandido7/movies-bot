import { Module } from '@nestjs/common'

import { LlmProvider } from '@app/ports'

import { EnvModule } from '@infra/env'
import { BedrockLlmProvider } from './amazon-bedrock/bedrock.provider'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: LlmProvider,
      useClass: BedrockLlmProvider,
    },
  ],
  exports: [LlmProvider],
})
export class LlmModule {}
