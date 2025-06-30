import { Injectable, Logger } from '@nestjs/common'
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'
import { EnvService } from '@infra/env'
import { ChatMessage, Intent, LlmProvider } from '@app/ports'
import { BedrockModelId } from '@domain/consts'

@Injectable()
export class BedrockLlmProvider implements LlmProvider {
  private readonly logger = new Logger(BedrockLlmProvider.name)
  private readonly client: BedrockRuntimeClient

  constructor(private readonly envService: EnvService) {
    this.client = new BedrockRuntimeClient({
      region: this.envService.get('AWS_REGION'),
    })
  }

  async analyzeIntent(text: string, history: ChatMessage[]): Promise<Intent> {
    const prompt = `
Você é um assistente especializado em classificar intenções de usuários que buscam **exclusivamente informações sobre filmes**.

Sua tarefa é analisar a mensagem mais recente e o histórico da conversa para determinar qual é a intenção principal do usuário **dentro do domínio de filmes**.

❗Se a mensagem estiver claramente relacionada a outro assunto que **não seja filmes**, como por exemplo: esportes, política, vida pessoal, finanças, tecnologia, etc — mas ainda assim for compreensível — classifique com:
{
  "type": "out_of_scope"
}

❗Se a mensagem não for compreensível, for ambígua ou impossível de classificar, retorne:
{
  "type": "unknown"
}

Caso a mensagem esteja relacionada a filmes, responda **apenas** com um JSON válido no seguinte formato:

{
  "type": "<intenção>",
  "movieName": "Nome do Filme (se aplicável)",
  "genre": "Nome do Gênero (se aplicável)"
}

As únicas opções válidas para o campo "type" são:

- get_synopsis
- get_cast
- get_rating
- get_popular_movies
- get_recommendation_by_genre
- get_similar_movies
- unknown
- out_of_scope

❌ Não responda com nenhuma explicação, comentário ou conteúdo adicional.
❌ Não invente campos que não estão no formato acima.
✅ Caso a intenção seja ambígua, retorne "unknown".

- Se a nova mensagem mencionar outro filme ou um novo título, **você deve usar esse novo título como o movieName, mesmo que seja uma continuação da conversa**.
- Exemplo: se antes falávamos sobre "Coringa", mas agora o usuário diz "e do filme Divertidamente?", considere "Divertidamente" como o novo foco.

Histórico da conversa:
${history.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}

Mensagem atual do usuário:
"${text}"
`.trim()

    try {
      const responseText = await this.invoke(
        prompt,
        BedrockModelId.CLAUDE_3_HAIKU,
      )

      const jsonMatch = responseText.match(/\{[\s\S]*?\}/)

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        if (typeof parsed.type === 'string') {
          return parsed as Intent
        }
      }

      return { type: 'unknown' }
    } catch (error) {
      this.logger.error('Erro ao analisar intenção no Bedrock', error)
      return { type: 'unknown' }
    }
  }

  async generateText(
    prompt: string,
    modelId: BedrockModelId = BedrockModelId.CLAUDE_3_SONNET,
  ): Promise<string> {
    try {
      const responseText = await this.invoke(prompt, modelId)
      return responseText
    } catch (error) {
      this.logger.error(
        `Erro ao gerar texto no Bedrock com o modelo ${modelId}`,
        error,
      )
      return 'Desculpe, não consegui processar sua solicitação no momento.'
    }
  }

  /**
   * Método privado genérico para invocar modelos da família Claude.
   * @param prompt O prompt a ser enviado.
   * @param modelId O ID do modelo a ser invocado.
   */
  private async invoke(
    prompt: string,
    modelId: BedrockModelId,
  ): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    }

    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    })

    const apiResponse = await this.client.send(command)
    const decodedResponseBody = new TextDecoder().decode(apiResponse.body)
    const responseBody = JSON.parse(decodedResponseBody)
    return responseBody.content[0].text
  }

  async generateEmbedding(text: string): Promise<number[]> {
    throw new Error('Method not implemented.')
  }
}
