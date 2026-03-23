export interface AIProvider {
  id: string
  name: string
  isConfigured(): boolean
  generate(prompt: string, system: string): Promise<string>
  streamGenerate(
    prompt: string,
    system: string,
    onChunk: (text: string, isReasoning: boolean) => void
  ): Promise<void>
  generateJSON<T>(prompt: string, system: string): Promise<T>
}

export type AIProviderType = 'nvidia-nemotron' | 'ollama' | 'gemini' | 'groq' | 'openrouter'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning?: string
  timestamp: Date
  provider?: string
}

export interface AIConversation {
  id: string
  targetId: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
}
