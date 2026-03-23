import type { AIProvider, AIProviderType, AIHealthResult } from '@/types'
import { proxyFetch } from './proxyFetch'

/**
 * OpenRouter Provider — MULTI-MODEL GATEWAY.
 *
 * PRD Section 11.5: OpenRouter (optional) — 100+ models including free ones.
 * Uses OpenAI-compatible API format at openrouter.ai.
 * Default model: meta-llama/llama-3-8b-instruct:free
 *
 * OpenRouter requires HTTP-Referer and X-Title headers for identification.
 * Routes through /api/ai-proxy to avoid CORS blocking.
 */

const DEFAULT_OPENROUTER_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_OPENROUTER_MODEL = 'meta-llama/llama-3-8b-instruct:free'
const REQUEST_TIMEOUT = 30000

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class OpenRouterProvider implements AIProvider {
  id: AIProviderType = 'openrouter'
  name = 'OPENROUTER'

  private baseUrl: string
  private apiKey: string
  private model: string

  constructor(config?: { baseUrl?: string; apiKey?: string; model?: string }) {
    this.baseUrl = config?.baseUrl ?? DEFAULT_OPENROUTER_URL
    this.apiKey = config?.apiKey ?? ''
    this.model = config?.model ?? DEFAULT_OPENROUTER_MODEL
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0
  }

  async generate(prompt: string, system: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OPENROUTER: API KEY NOT CONFIGURED')
    }

    const response = await proxyFetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ] satisfies ChatMessage[],
        temperature: 0.9,
        max_tokens: 8192,
        stream: false,
      }),
      timeout: REQUEST_TIMEOUT,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`OPENROUTER ERROR ${String(response.status)}: ${errorText}`)
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content ?? ''
  }

  async streamGenerate(
    prompt: string,
    system: string,
    onChunk: (text: string, isReasoning: boolean) => void
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('OPENROUTER: API KEY NOT CONFIGURED')
    }

    const response = await proxyFetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ] satisfies ChatMessage[],
        temperature: 0.9,
        max_tokens: 8192,
        stream: true,
      }),
      timeout: REQUEST_TIMEOUT,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`OPENROUTER STREAM ERROR ${String(response.status)}: ${errorText}`)
    }

    if (!response.body) {
      throw new Error('OPENROUTER: NO RESPONSE BODY FOR STREAMING')
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
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const jsonStr = trimmed.slice(6)
          if (jsonStr === '[DONE]') return

          try {
            const chunk = JSON.parse(jsonStr) as {
              choices?: Array<{
                delta?: { content?: string }
              }>
            }

            const content = chunk.choices?.[0]?.delta?.content
            if (content) {
              onChunk(content, false)
            }
          } catch {
            // Skip malformed SSE lines
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
    if (!this.isConfigured()) {
      return { ok: false, latencyMs: 0, error: 'API KEY NOT CONFIGURED', model: this.model }
    }

    const start = performance.now()
    try {
      const response = await proxyFetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.buildHeaders(),
        timeout: 10000,
      })

      const latencyMs = Math.round(performance.now() - start)

      if (response.ok) {
        return { ok: true, latencyMs, model: this.model }
      }

      if (response.status === 401) {
        return { ok: false, latencyMs, error: 'INVALID API KEY', model: this.model }
      }

      return {
        ok: false,
        latencyMs,
        error: `API RETURNED ${String(response.status)}`,
        model: this.model,
      }
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start)
      const message = err instanceof Error ? err.message : 'UNKNOWN ERROR'
      return { ok: false, latencyMs, error: message, model: this.model }
    }
  }

  private buildHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://sentinelprime.app',
      'X-Title': 'SentinelPrime OSINT Platform',
    }
  }
}
