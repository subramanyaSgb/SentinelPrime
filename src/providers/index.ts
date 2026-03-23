/**
 * AI Provider Registry — central hub for all AI provider instances.
 *
 * Creates provider instances from settings store config and provides:
 * - getProvider(id) — get a specific provider
 * - getActiveProvider() — get the currently active (default) provider
 * - checkAllHealth() — run health checks on all configured providers
 * - providers — map of all provider instances
 */

import type { AIProvider, AIProviderType, AIHealthResult } from '@/types'
import type { ProviderConfig } from '@/store/settingsStore'
import { NvidiaProvider } from './NvidiaProvider'
import { OllamaProvider } from './OllamaProvider'
import { GeminiProvider } from './GeminiProvider'
import { GroqProvider } from './GroqProvider'
import { OpenRouterProvider } from './OpenRouterProvider'

export { NvidiaProvider } from './NvidiaProvider'
export { OllamaProvider } from './OllamaProvider'
export { GeminiProvider } from './GeminiProvider'
export { GroqProvider } from './GroqProvider'
export { OpenRouterProvider } from './OpenRouterProvider'

/** Create a provider instance from a ProviderConfig */
function createProvider(config: ProviderConfig): AIProvider {
  switch (config.id) {
    case 'nvidia-nemotron':
      return new NvidiaProvider({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey || undefined, // Falls back to bundled key
        model: config.model,
      })
    case 'ollama':
      return new OllamaProvider({
        baseUrl: config.baseUrl,
        model: config.model,
      })
    case 'gemini':
      return new GeminiProvider({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
      })
    case 'groq':
      return new GroqProvider({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
      })
    case 'openrouter':
      return new OpenRouterProvider({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
      })
    default:
      // Exhaustive check
      throw new Error(`UNKNOWN PROVIDER: ${String(config.id)}`)
  }
}

/** Build a map of all provider instances from settings configs */
export function createProviderMap(
  configs: ProviderConfig[]
): Map<AIProviderType, AIProvider> {
  const map = new Map<AIProviderType, AIProvider>()
  for (const config of configs) {
    map.set(config.id, createProvider(config))
  }
  return map
}

/** Get the active (default) provider from a config list */
export function getActiveProviderFromConfigs(
  configs: ProviderConfig[]
): AIProvider {
  const defaultConfig = configs.find((c) => c.isDefault)
  if (!defaultConfig) {
    // Fallback to NVIDIA (always configured)
    return new NvidiaProvider()
  }
  return createProvider(defaultConfig)
}

/** Run health checks on all configured providers in parallel */
export async function checkAllProviderHealth(
  configs: ProviderConfig[]
): Promise<Map<AIProviderType, AIHealthResult>> {
  const results = new Map<AIProviderType, AIHealthResult>()

  const checks = configs.map(async (config) => {
    const provider = createProvider(config)
    const result = await provider.checkHealth()
    results.set(config.id, result)
  })

  await Promise.allSettled(checks)
  return results
}

/** Count how many providers are online from health results */
export function countOnlineProviders(
  results: Map<AIProviderType, AIHealthResult>
): { online: number; total: number } {
  let online = 0
  let total = 0
  for (const result of results.values()) {
    total++
    if (result.ok) online++
  }
  return { online, total }
}
