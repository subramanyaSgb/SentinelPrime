/**
 * AIProvider — the modular interface that abstracts all LLM providers.
 * PRD Section 11.5: Modular AIProvider interface.
 *
 * Every provider (NVIDIA, Ollama, Gemini, Groq, OpenRouter) implements this
 * interface. The app uses the active provider through this abstraction layer.
 */
export interface AIProvider {
  /** Unique provider identifier */
  id: AIProviderType
  /** Display name */
  name: string

  /** Whether this provider has valid configuration (key / URL) */
  isConfigured(): boolean

  /**
   * Non-streaming text generation.
   * Returns the full response text after completion.
   */
  generate(prompt: string, system: string): Promise<string>

  /**
   * Streaming text generation with reasoning support.
   * Calls onChunk for each piece of text as it arrives.
   * @param onChunk - callback with (text, isReasoning) — isReasoning=true for CoT
   */
  streamGenerate(
    prompt: string,
    system: string,
    onChunk: (text: string, isReasoning: boolean) => void
  ): Promise<void>

  /**
   * Generate a structured JSON response.
   * The prompt should instruct the model to return valid JSON.
   */
  generateJSON<T>(prompt: string, system: string): Promise<T>

  /**
   * Health check — verifies the provider is reachable and configured correctly.
   * Returns { ok, latencyMs, error? }
   */
  checkHealth(): Promise<AIHealthResult>
}

/** Result from a provider health check */
export interface AIHealthResult {
  ok: boolean
  latencyMs: number
  error?: string
  model?: string
}

/** All supported provider types */
export type AIProviderType = 'nvidia-nemotron' | 'ollama' | 'gemini' | 'groq' | 'openrouter'

/** A single message in an AI conversation */
export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning?: string
  timestamp: Date
  provider?: string
}

/** An AI conversation tied to a target */
export interface AIConversation {
  id: string
  targetId: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
}
