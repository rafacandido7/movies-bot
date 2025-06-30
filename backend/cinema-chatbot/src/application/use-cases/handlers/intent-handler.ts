import { ChatMessage, Intent } from '../../ports/llm.provider'

export abstract class IntentHandler {
  abstract execute(intent: Intent, history: ChatMessage[]): Promise<string>
}
