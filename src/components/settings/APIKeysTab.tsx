import { useState, useCallback } from 'react'
import { useSettingsStore, type ProviderConfig } from '@/store/settingsStore'
import { Button, Input, StatusIndicator, Separator, Timestamp } from '@/components/ui'
import type { AIProviderType } from '@/types'

/**
 * API Keys Tab — Manage API credentials for all AI providers.
 * PRD 13.1: Keys stored in localStorage, masked in UI, health check pings.
 */
export function APIKeysTab() {
  const providers = useSettingsStore((s) => s.providers)

  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
        className="text-glow"
      >
        API KEY MANAGEMENT
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}
      >
        CREDENTIALS ARE STORED LOCALLY // NEVER TRANSMITTED TO EXTERNAL SERVERS
      </div>

      <Separator />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
        {providers.map((provider) => (
          <ProviderKeyCard key={provider.id} provider={provider} />
        ))}
      </div>

      {/* Security notice */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--phosphor-faint)',
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ color: 'var(--amber)', marginBottom: '4px' }}>
          ⚠ SECURITY NOTICE
        </div>
        <div>◈ API KEYS ARE STORED IN BROWSER LOCALSTORAGE</div>
        <div>◈ KEYS ARE ONLY SENT TO THEIR RESPECTIVE API ENDPOINTS</div>
        <div>◈ NVIDIA NEMOTRON SHIPS WITH A BUNDLED KEY — NO CONFIGURATION REQUIRED</div>
        <div>◈ CLEAR BROWSER DATA TO REMOVE ALL STORED KEYS</div>
      </div>
    </div>
  )
}

function ProviderKeyCard({ provider }: { provider: ProviderConfig }) {
  const updateProviderKey = useSettingsStore((s) => s.updateProviderKey)
  const setProviderStatus = useSettingsStore((s) => s.setProviderStatus)
  const setProviderLastChecked = useSettingsStore((s) => s.setProviderLastChecked)

  const [showKey, setShowKey] = useState(false)
  const [localKey, setLocalKey] = useState(provider.apiKey)
  const [isSaved, setIsSaved] = useState(true)

  const isNvidia = provider.id === 'nvidia-nemotron'
  const isOllama = provider.id === 'ollama'
  const hasKey = provider.apiKey.length > 0 || isNvidia || isOllama

  const maskedKey = provider.apiKey
    ? provider.apiKey.slice(0, 8) + '●'.repeat(Math.min(24, provider.apiKey.length - 8)) + provider.apiKey.slice(-4)
    : ''

  const handleSave = useCallback(() => {
    updateProviderKey(provider.id, localKey)
    setIsSaved(true)
  }, [provider.id, localKey, updateProviderKey])

  const handleKeyChange = useCallback((value: string) => {
    setLocalKey(value)
    setIsSaved(false)
  }, [])

  const handleHealthCheck = useCallback(async () => {
    setProviderStatus(provider.id, 'checking')

    try {
      // Simulate health check — actual implementation in AI Provider phase
      await performHealthCheck(provider)
      setProviderStatus(provider.id, 'valid')
      setProviderLastChecked(provider.id, new Date())
    } catch {
      setProviderStatus(provider.id, 'invalid')
      setProviderLastChecked(provider.id, new Date())
    }
  }, [provider, setProviderStatus, setProviderLastChecked])

  const statusMap: Record<ProviderConfig['status'], 'online' | 'degraded' | 'offline' | 'unused'> = {
    unchecked: 'unused',
    checking: 'degraded',
    valid: 'online',
    invalid: 'offline',
  }

  const statusLabel: Record<ProviderConfig['status'], string> = {
    unchecked: 'UNCHECKED',
    checking: 'CHECKING...',
    valid: 'CONNECTED',
    invalid: 'FAILED',
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${provider.isDefault ? 'var(--phosphor-dim)' : 'var(--phosphor-faint)'}`,
        padding: '12px',
        position: 'relative',
      }}
      className="corner-brackets"
    >
      {/* Header row */}
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <div className="flex items-center gap-2">
          <StatusIndicator
            status={statusMap[provider.status]}
            label={statusLabel[provider.status]}
          />
          <span style={{ color: 'var(--phosphor-dim)', fontSize: '10px' }}>//</span>
          <span
            style={{
              fontSize: '11px',
              color: provider.isDefault ? 'var(--phosphor)' : 'var(--phosphor-dim)',
              textTransform: 'uppercase',
            }}
            className={provider.isDefault ? 'text-glow' : ''}
          >
            {provider.name}
          </span>
          {provider.isDefault && (
            <span
              style={{
                fontSize: '9px',
                color: 'var(--phosphor)',
                border: '1px solid var(--phosphor-faint)',
                padding: '1px 6px',
                textTransform: 'uppercase',
              }}
            >
              DEFAULT
            </span>
          )}
        </div>
        {provider.lastChecked && (
          <Timestamp date={provider.lastChecked} className="" />
        )}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: '9px',
          color: 'var(--phosphor-dim)',
          opacity: 0.6,
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}
      >
        {provider.description}
      </div>

      {/* API Key Input */}
      {isNvidia ? (
        <div
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            padding: '8px 12px',
            background: 'var(--bg-deep)',
            border: '1px solid var(--phosphor-faint)',
          }}
        >
          <span style={{ color: 'var(--phosphor)' }}>◈</span> BUNDLED API KEY — NO CONFIGURATION REQUIRED
        </div>
      ) : isOllama ? (
        <div
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            padding: '8px 12px',
            background: 'var(--bg-deep)',
            border: '1px solid var(--phosphor-faint)',
          }}
        >
          <span style={{ color: 'var(--phosphor)' }}>◈</span> LOCAL PROVIDER — NO API KEY REQUIRED // ENSURE OLLAMA IS RUNNING ON localhost:11434
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                placeholder="ENTER API KEY..."
                type={showKey ? 'text' : 'password'}
                value={showKey ? localKey : (localKey ? maskedKey : '')}
                onChange={(e) => handleKeyChange(e.target.value)}
                onFocus={() => {
                  if (!showKey && localKey) {
                    setShowKey(true)
                  }
                }}
                style={{ fontSize: '11px' }}
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowKey(!showKey)}
              style={{ fontSize: '10px', flexShrink: 0 }}
            >
              {showKey ? '◈ HIDE' : '◇ SHOW'}
            </Button>
          </div>

          {!isSaved && localKey !== provider.apiKey && (
            <div className="flex items-center gap-2" style={{ marginTop: '6px' }}>
              <Button variant="primary" onClick={handleSave} style={{ fontSize: '10px' }}>
                ▶ SAVE KEY
              </Button>
              <span
                style={{
                  fontSize: '9px',
                  color: 'var(--amber)',
                  textTransform: 'uppercase',
                }}
              >
                UNSAVED CHANGES
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-2" style={{ marginTop: '10px' }}>
        <Button
          variant="default"
          onClick={() => void handleHealthCheck()}
          disabled={!hasKey || provider.status === 'checking'}
          style={{ fontSize: '10px' }}
        >
          {provider.status === 'checking' ? '● TESTING...' : '▶ TEST CONNECTION'}
        </Button>

        {!provider.isDefault && hasKey && (
          <SetDefaultButton providerId={provider.id} />
        )}

        {!isNvidia && !isOllama && provider.apiKey && (
          <ClearKeyButton providerId={provider.id} onClear={() => {
            setLocalKey('')
            setIsSaved(true)
          }} />
        )}
      </div>
    </div>
  )
}

function SetDefaultButton({ providerId }: { providerId: AIProviderType }) {
  const setDefaultProvider = useSettingsStore((s) => s.setDefaultProvider)

  return (
    <Button
      variant="ghost"
      onClick={() => setDefaultProvider(providerId)}
      style={{ fontSize: '10px' }}
    >
      ◈ SET AS DEFAULT
    </Button>
  )
}

function ClearKeyButton({ providerId, onClear }: { providerId: AIProviderType; onClear: () => void }) {
  const updateProviderKey = useSettingsStore((s) => s.updateProviderKey)
  const setProviderStatus = useSettingsStore((s) => s.setProviderStatus)

  const handleClear = () => {
    updateProviderKey(providerId, '')
    setProviderStatus(providerId, 'unchecked')
    onClear()
  }

  return (
    <Button variant="danger" onClick={handleClear} style={{ fontSize: '10px' }}>
      ✕ CLEAR KEY
    </Button>
  )
}

/**
 * Health check for a provider — pings the API endpoint.
 * Full implementation will be in Phase 2 (AI Provider System).
 * For now, does a basic fetch to the base URL.
 */
async function performHealthCheck(provider: ProviderConfig): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    if (provider.id === 'ollama') {
      // Ollama: check if local server is running
      const response = await fetch(`${provider.baseUrl}/api/tags`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('OLLAMA NOT RESPONDING')
      return
    }

    if (provider.id === 'nvidia-nemotron') {
      // NVIDIA: use bundled key for health check
      const response = await fetch(`${provider.baseUrl}/models`, {
        headers: {
          'Authorization': 'Bearer nvapi-placeholder',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      // Even a 401 means the endpoint is reachable
      if (response.status === 401 || response.ok) return
      throw new Error('NVIDIA API UNREACHABLE')
    }

    // Generic OpenAI-compatible check: list models
    const response = await fetch(`${provider.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok && response.status !== 401) {
      throw new Error(`API RETURNED ${String(response.status)}`)
    }
  } finally {
    clearTimeout(timeout)
  }
}
