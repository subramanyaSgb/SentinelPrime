import type { AIProvider, AIProviderType, AIHealthResult } from '@/types'

/**
 * Groq Provider — ULTRA-FAST INFERENCE.
 *
 * PRD Section 11.5: Groq API (optional) — Ultra-fast free tier.
 * Uses OpenAI-compatible API format at api.groq.com.
 * Default model: llama3-70b-8192 (free tier).
 */

const DEFAULT_GROQ_URL = 'https://api.groq.com/openai/v1'
const DEFAULT_GROQ_MODEL = 'llama3-70b-8192'
const REQUEST_TIMEOUT = 30000

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class GroqProvider implements AIProvider {
  id: AIProviderType = 'groq'
  name = 'GROQ'

  private baseUrl: string
  private apiKey: string
  private model: string

  constructor(config?: { baseUrl?: string; apiKey?: string; model?: string }) {
    this.baseUrl = config?.baseUrl ?? DEFAULT_GROQ_URL
    this.apiKey = config?.apiKey ?? ''
    this.model = config?.model ?? DEFAULT_GROQ_MODEL
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0
  }

  async generate(prompt: string, system: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('GROQ: API KEY NOT CONFIGURED')
    }

    const response = await this.fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
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
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`GROQ ERROR ${String(response.status)}: ${errorText}`)
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
      throw new Error('GROQ: API KEY NOT CONFIGURED')
    }

    const response = await this.fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
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
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`GROQ STREAM ERROR ${String(response.status)}: ${errorText}`)
    }

    if (!response.body) {
      throw new Error('GROQ: NO RESPONSE BODY FOR STREAMING')
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
      const response = await this.fetchWithTimeout(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.buildHeaders(),
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
    }
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      return await fetch(url, { ...init, signal: controller.signal })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('GROQ TIMEOUT: REQUEST EXCEEDED 30S')
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }
}
