import { Module } from '@nestjs/common'

import { EnvModule } from '@infra/env'
import { MongoDbModule } from './mongodb'

@Module({
  imports: [EnvModule, MongoDbModule],
  providers: [],
  exports: [MongoDbModule],
})
export class DatabaseModule {}
