import type { AIProvider, AIProviderType, AIHealthResult } from '@/types'

/**
 * Google Gemini Provider — CLOUD AI FALLBACK.
 *
 * PRD Section 11.5: Gemini API (free fallback) — 1500 req/day free tier.
 * Uses Gemini's REST API (generativelanguage.googleapis.com).
 *
 * Note: Gemini uses a different API format than OpenAI-compatible providers.
 * API key is passed as a URL parameter, not a Bearer token.
 */

const DEFAULT_GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta'
const DEFAULT_GEMINI_MODEL = 'gemini-pro'
const REQUEST_TIMEOUT = 30000

interface GeminiContent {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

export class GeminiProvider implements AIProvider {
  id: AIProviderType = 'gemini'
  name = 'GOOGLE GEMINI'

  private baseUrl: string
  private apiKey: string
  private model: string

  constructor(config?: { baseUrl?: string; apiKey?: string; model?: string }) {
    this.baseUrl = config?.baseUrl ?? DEFAULT_GEMINI_URL
    this.apiKey = config?.apiKey ?? ''
    this.model = config?.model ?? DEFAULT_GEMINI_MODEL
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0
  }

  async generate(prompt: string, system: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('GEMINI: API KEY NOT CONFIGURED')
    }

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`
    const contents = this.buildContents(prompt, system)

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`GEMINI ERROR ${String(response.status)}: ${errorText}`)
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> }
      }>
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }

  async streamGenerate(
    prompt: string,
    system: string,
    onChunk: (text: string, isReasoning: boolean) => void
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('GEMINI: API KEY NOT CONFIGURED')
    }

    const url = `${this.baseUrl}/models/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`
    const contents = this.buildContents(prompt, system)

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`GEMINI STREAM ERROR ${String(response.status)}: ${errorText}`)
    }

    if (!response.body) {
      throw new Error('GEMINI: NO RESPONSE BODY FOR STREAMING')
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

          try {
            const chunk = JSON.parse(jsonStr) as {
              candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> }
              }>
            }

            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              // Gemini doesn't have separate reasoning — all content is final
              onChunk(text, false)
            }
          } catch {
            // Skip malformed SSE chunks
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
      // List models to verify API key and connectivity
      const url = `${this.baseUrl}/models?key=${this.apiKey}`
      const response = await this.fetchWithTimeout(url, { method: 'GET' })

      const latencyMs = Math.round(performance.now() - start)

      if (response.ok) {
        return { ok: true, latencyMs, model: this.model }
      }

      if (response.status === 400 || response.status === 403) {
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

  /**
   * Build Gemini-format content array.
   * System prompt is prepended to the first user message since Gemini
   * doesn't have a dedicated system role in all model versions.
   */
  private buildContents(prompt: string, system: string): GeminiContent[] {
    const combinedPrompt = system
      ? `[System Instructions]\n${system}\n\n[User Query]\n${prompt}`
      : prompt

    return [{ role: 'user', parts: [{ text: combinedPrompt }] }]
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
        throw new Error('GEMINI TIMEOUT: REQUEST EXCEEDED 30S')
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }
}
