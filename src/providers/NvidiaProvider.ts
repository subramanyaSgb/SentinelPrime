import type { AIProvider, AIProviderType, AIHealthResult } from '@/types'

/**
 * NVIDIA Nemotron-3 Super 120B Provider — PRIMARY AI PROVIDER.
 *
 * CLAUDE.md Section 4: Uses OpenAI-compatible API at integrate.api.nvidia.com
 * - enable_thinking: true (always) — activates chain-of-thought reasoning
 * - reasoning_budget: 16384 (always)
 * - Handles both reasoning_content (CoT) and content (final answer) in streaming
 * - Bundled API key — no user configuration required
 *
 * Uses native fetch instead of openai SDK to avoid browser bundle bloat.
 */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const NVIDIA_API_KEY = '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'
const NVIDIA_MODEL = 'nvidia/nemotron-3-super-120b-a12b'
const REQUEST_TIMEOUT = 30000

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface NvidiaRequestBody {
  model: string
  messages: ChatMessage[]
  temperature: number
  top_p: number
  max_tokens: number
  stream: boolean
  chat_template_kwargs: { enable_thinking: boolean }
  reasoning_budget: number
}

export class NvidiaProvider implements AIProvider {
  id: AIProviderType = 'nvidia-nemotron'
  name = 'NVIDIA NEMOTRON-3 SUPER 120B'

  private baseUrl: string
  private apiKey: string
  private model: string

  constructor(config?: { baseUrl?: string; apiKey?: string; model?: string }) {
    this.baseUrl = config?.baseUrl ?? NVIDIA_BASE_URL
    this.apiKey = config?.apiKey ?? NVIDIA_API_KEY
    this.model = config?.model ?? NVIDIA_MODEL
  }

  isConfigured(): boolean {
    // Always configured — bundled API key
    return true
  }

  async generate(prompt: string, system: string): Promise<string> {
    const body = this.buildRequestBody(
      [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      false
    )

    const response = await this.fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`NVIDIA API ERROR ${String(response.status)}: ${errorText}`)
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
    const body = this.buildRequestBody(
      [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      true
    )

    const response = await this.fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'UNKNOWN ERROR')
      throw new Error(`NVIDIA API ERROR ${String(response.status)}: ${errorText}`)
    }

    if (!response.body) {
      throw new Error('NVIDIA API: NO RESPONSE BODY FOR STREAMING')
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
        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const jsonStr = trimmed.slice(6)
          if (jsonStr === '[DONE]') return

          try {
            const chunk = JSON.parse(jsonStr) as {
              choices?: Array<{
                delta?: {
                  content?: string
                  reasoning_content?: string
                }
              }>
            }

            if (!chunk.choices?.length) continue
            const delta = chunk.choices[0]?.delta

            // NVIDIA Nemotron: reasoning_content is CoT thinking
            if (delta?.reasoning_content) {
              onChunk(delta.reasoning_content, true)
            }
            // Regular content is the final answer
            if (delta?.content) {
              onChunk(delta.content, false)
            }
          } catch {
            // Skip malformed JSON chunks — happens occasionally in SSE streams
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
      const response = await this.fetchWithTimeout(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.buildHeaders(),
      })

      const latencyMs = Math.round(performance.now() - start)

      // Even 401 means endpoint is reachable
      if (response.ok || response.status === 401) {
        return { ok: true, latencyMs, model: this.model }
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

  private buildRequestBody(
    messages: ChatMessage[],
    stream: boolean
  ): NvidiaRequestBody {
    return {
      model: this.model,
      messages,
      temperature: 1,
      top_p: 0.95,
      max_tokens: 16384,
      stream,
      chat_template_kwargs: { enable_thinking: true },
      reasoning_budget: 16384,
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
        throw new Error('NVIDIA API TIMEOUT: REQUEST EXCEEDED 30S')
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }
}
