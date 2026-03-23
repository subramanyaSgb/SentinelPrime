import { useState, useCallback } from 'react'
import { useSettingsStore, type ProviderConfig } from '@/store/settingsStore'
import { Button, Input, StatusIndicator, Separator, Timestamp } from '@/components/ui'
import { useAIHealthCheck } from '@/hooks/useAIProvider'
import type { AIProviderType } from '@/types'

/**
 * API Keys Tab — Manage API credentials for all AI providers.
 * PRD 13.1: Keys stored in localStorage, masked in UI, health check pings.
 */
export function APIKeysTab() {
  const providers = useSettingsStore((s) => s.providers)
  const { checkAll, checkOne, isChecking, onlineCount, totalCount } = useAIHealthCheck()

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
        <div
          style={{
            fontSize: '13px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
          }}
          className="text-glow"
        >
          API KEY MANAGEMENT
        </div>
        <Button
          variant="default"
          onClick={() => void checkAll()}
          disabled={isChecking}
          style={{ fontSize: '10px' }}
        >
          {isChecking ? '● TESTING ALL...' : `▶ TEST ALL // ${String(onlineCount)}/${String(totalCount)} ONLINE`}
        </Button>
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
          <ProviderKeyCard key={provider.id} provider={provider} onCheckHealth={checkOne} />
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

function ProviderKeyCard({
  provider,
  onCheckHealth,
}: {
  provider: ProviderConfig
  onCheckHealth: (id: AIProviderType) => Promise<unknown>
}) {
  const updateProviderKey = useSettingsStore((s) => s.updateProviderKey)

  const [showKey, setShowKey] = useState(false)
  const [localKey, setLocalKey] = useState(provider.apiKey)
  const [isSaved, setIsSaved] = useState(true)
  const [lastLatency, setLastLatency] = useState<number | null>(null)

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
    const result = await onCheckHealth(provider.id) as { latencyMs?: number } | undefined
    if (result && typeof result.latencyMs === 'number') {
      setLastLatency(result.latencyMs)
    }
  }, [provider.id, onCheckHealth])

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

        {lastLatency !== null && provider.status === 'valid' && (
          <span style={{ fontSize: '9px', color: 'var(--phosphor-dim)' }}>
            {String(lastLatency)}MS LATENCY
          </span>
        )}

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

// Health checks are now handled by the provider registry
// via useAIHealthCheck hook → provider.checkHealth()
// See: src/providers/index.ts and src/hooks/useAIProvider.ts
