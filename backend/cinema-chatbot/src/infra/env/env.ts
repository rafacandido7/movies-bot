import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator'

export class Env {
  @IsNotEmpty()
  @IsNumber()
  API_PORT: number

  @IsNotEmpty()
  @IsString()
  AWS_ACCESS_KEY_ID: string

  @IsNotEmpty()
  @IsString()
  AWS_SECRET_ACCESS_KEY: string

  @IsNotEmpty()
  @IsString()
  AWS_REGION: string

  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string

  @IsNotEmpty()
  @IsString()
  DATABASE_NAME: string

  @IsNotEmpty()
  @IsString()
  TMDB_BASE_URL: string

  @IsNotEmpty()
  @IsString()
  TMDB_READ_ACCESS_KEY: string
}

export const env: Env = plainToInstance(Env, {
  API_PORT: Number(process.env.API_PORT),
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_NAME: process.env.DATABASE_NAME,
  TMDB_BASE_URL: process.env.TMDB_BASE_URL,
  TMDB_READ_ACCESS_KEY: process.env.TMDB_READ_ACCESS_KEY,
})

const errors = validateSync(env)

if (errors.length > 0) {
  throw new Error(JSON.stringify(errors, null, 2))
}
