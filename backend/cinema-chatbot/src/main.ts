import 'dotenv/config'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'

import { env } from '@infra/env'
import {
  HttpLoggingInterceptor,
  TransformResponseInterceptor,
} from './presentation/interceptors'

const { API_PORT } = env

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  })

  app.enableCors()
  app.disable('x-powered-by')

  const reflector = app.get(Reflector)

  app.useGlobalInterceptors(
    new HttpLoggingInterceptor(),
    new TransformResponseInterceptor(reflector),
  )

  app.useGlobalPipes(new ValidationPipe())

  const config = new DocumentBuilder()
    .setTitle('Cinema Chatbot API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  })

  await app.listen(API_PORT, () => {
    console.log(
      '\n\x1b[34m\x1b[1m%s\x1b[0m',
      `Listening in port ${API_PORT} 🚀!`,
    )
  })
}

bootstrap()
