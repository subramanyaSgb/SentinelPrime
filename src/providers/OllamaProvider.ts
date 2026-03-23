import type { AIProvider, AIProviderType, AIHealthResult } from '@/types'
import { fetchWithTimeout } from './proxyFetch'

/**
 * Ollama Provider — LOCAL LLM PROVIDER.
 *
 * PRD Section 11.5: Ollama (default) — llama3.2, mistral, phi3 — free forever.
 * Runs locally on the user's machine. No API key required.
 * Uses Ollama's REST API on localhost:11434.
 *
 * No CORS proxy needed — localhost requests are same-origin.
 */

const DEFAULT_OLLAMA_URL = 'http://localhost:11434'
const DEFAULT_OLLAMA_MODEL = 'llama3.2'
const REQUEST_TIMEOUT = 60000 // Longer timeout for local inference

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class OllamaProvider implements AIProvider {
  id: AIProviderType = 'ollama'
  name = 'OLLAMA (LOCAL)'

  private baseUrl: string
  private model: string

  constructor(config?: { baseUrl?: string; model?: string }) {
    this.baseUrl = config?.baseUrl ?? DEFAULT_OLLAMA_URL
    this.model = config?.model ?? DEFAULT_OLLAMA_MODEL
  }

  isConfigured(): boolean {
    // Ollama doesn't need an API key, just needs to be running
    return this.baseUrl.length > 0
  }

  async generate(prompt: string, system: string): Promise<string> {
    const response = await fetchWithTimeout(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ] satisfies ChatMessage[],
        stream: false,
      }),
    }, REQUEST_TIMEOUT)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`OLLAMA ERROR ${String(response.status)}: ${errorText}`)
    }

    const data = await response.json() as {
      message?: { content?: string }
    }
    return data.message?.content ?? ''
  }

  async streamGenerate(
    prompt: string,
    system: string,
    onChunk: (text: string, isReasoning: boolean) => void
  ): Promise<void> {
    const response = await fetchWithTimeout(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ] satisfies ChatMessage[],
        stream: true,
      }),
    }, REQUEST_TIMEOUT)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`OLLAMA ERROR ${String(response.status)}: ${errorText}`)
    }

    if (!response.body) {
      throw new Error('OLLAMA: NO RESPONSE BODY FOR STREAMING')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          try {
            const chunk = JSON.parse(trimmed) as {
              message?: { content?: string }
              done?: boolean
            }

            if (chunk.done) return

            if (chunk.message?.content) {
              // Ollama doesn't have separate reasoning — all content is final
              onChunk(chunk.message.content, false)
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async generateJSON<T>(prompt: string, system: string): Promise<T> {
    const text = await this.generate(
      prompt + '\n\nRespond ONLY with valid JSON. No markdown. No explanation.',
      system
    )
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    return JSON.parse(clean) as T
  }

  async checkHealth(): Promise<AIHealthResult> {
    const start = performance.now()
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      }, 10000)

      const latencyMs = Math.round(performance.now() - start)

      if (!response.ok) {
        return {
          ok: false,
          latencyMs,
          error: `OLLAMA RETURNED ${String(response.status)}`,
          model: this.model,
        }
      }

      const data = await response.json() as {
        models?: Array<{ name?: string }>
      }

      const modelNames = data.models?.map((m) => m.name ?? '') ?? []
      const modelAvailable = modelNames.some(
        (name) => name === this.model || name.startsWith(`${this.model}:`)
      )

      if (!modelAvailable && modelNames.length > 0) {
        return {
          ok: true,
          latencyMs,
          error: `MODEL "${this.model}" NOT FOUND. AVAILABLE: ${modelNames.slice(0, 5).join(', ')}`,
          model: this.model,
        }
      }

      return { ok: true, latencyMs, model: this.model }
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start)
      const message = err instanceof Error ? err.message : 'UNKNOWN ERROR'

      // Common case: Ollama not running
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        return {
          ok: false,
          latencyMs,
          error: 'OLLAMA NOT RUNNING — START WITH: ollama serve',
          model: this.model,
        }
      }

      return { ok: false, latencyMs, error: message, model: this.model }
    }
  }
}
