import { useMemo, useCallback, useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useAppStore } from '@/store/appStore'
import { getActiveProviderFromConfigs, checkAllProviderHealth, countOnlineProviders } from '@/providers'
import type { AIProvider, AIHealthResult, AIProviderType } from '@/types'

/**
 * useAIProvider — React hook providing the active AI provider instance.
 *
 * Returns the current provider based on settings store config.
 * Automatically recreates when the active provider or its config changes.
 */
export function useAIProvider(): AIProvider {
  const providers = useSettingsStore((s) => s.providers)
  const activeProviderId = useAppStore((s) => s.activeProvider)

  return useMemo(() => {
    // Find the config matching the active provider ID
    const activeConfig = providers.find((p) => p.id === activeProviderId)
    if (activeConfig) {
      // Use the active provider's config, but mark it as default for factory
      return getActiveProviderFromConfigs(
        providers.map((p) => ({ ...p, isDefault: p.id === activeProviderId }))
      )
    }
    // Fallback: use whatever is marked as default
    return getActiveProviderFromConfigs(providers)
  }, [providers, activeProviderId])
}

/**
 * useAIHealthCheck — React hook for running provider health checks.
 *
 * Returns health check state and a function to trigger checks.
 */
export function useAIHealthCheck(): {
  results: Map<AIProviderType, AIHealthResult>
  isChecking: boolean
  onlineCount: number
  totalCount: number
  checkAll: () => Promise<void>
  checkOne: (id: AIProviderType) => Promise<AIHealthResult>
} {
  const providers = useSettingsStore((s) => s.providers)
  const setProviderStatus = useSettingsStore((s) => s.setProviderStatus)
  const setProviderLastChecked = useSettingsStore((s) => s.setProviderLastChecked)

  const [results, setResults] = useState<Map<AIProviderType, AIHealthResult>>(new Map())
  const [isChecking, setIsChecking] = useState(false)

  const { online: onlineCount, total: totalCount } = useMemo(
    () => countOnlineProviders(results),
    [results]
  )

  const checkAll = useCallback(async () => {
    setIsChecking(true)

    // Mark all as checking
    for (const p of providers) {
      setProviderStatus(p.id, 'checking')
    }

    try {
      const healthResults = await checkAllProviderHealth(providers)
      setResults(healthResults)

      // Update store with results
      for (const [id, result] of healthResults) {
        setProviderStatus(id, result.ok ? 'valid' : 'invalid')
        setProviderLastChecked(id, new Date())
      }
    } finally {
      setIsChecking(false)
    }
  }, [providers, setProviderStatus, setProviderLastChecked])

  const checkOne = useCallback(async (id: AIProviderType): Promise<AIHealthResult> => {
    setProviderStatus(id, 'checking')

    const config = providers.find((p) => p.id === id)
    if (!config) {
      const result: AIHealthResult = { ok: false, latencyMs: 0, error: 'PROVIDER NOT FOUND' }
      return result
    }

    const singleResult = await checkAllProviderHealth([config])
    const result = singleResult.get(id) ?? { ok: false, latencyMs: 0, error: 'CHECK FAILED' }

    setResults((prev) => {
      const next = new Map(prev)
      next.set(id, result)
      return next
    })

    setProviderStatus(id, result.ok ? 'valid' : 'invalid')
    setProviderLastChecked(id, new Date())

    return result
  }, [providers, setProviderStatus, setProviderLastChecked])

  return { results, isChecking, onlineCount, totalCount, checkAll, checkOne }
}
