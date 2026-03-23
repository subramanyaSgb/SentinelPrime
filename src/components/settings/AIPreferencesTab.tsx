import { useSettingsStore } from '@/store/settingsStore'
import { useAppStore } from '@/store/appStore'
import { Input, StatusIndicator, Separator } from '@/components/ui'
import type { AIProviderType } from '@/types'

/**
 * AI Preferences Tab — Select default provider, configure model params.
 * PRD Section 11.5 — AI Layer configuration.
 */
export function AIPreferencesTab() {
  const providers = useSettingsStore((s) => s.providers)
  const updateProviderModel = useSettingsStore((s) => s.updateProviderModel)
  const updateProviderBaseUrl = useSettingsStore((s) => s.updateProviderBaseUrl)
  const setDefaultProvider = useSettingsStore((s) => s.setDefaultProvider)
  const activeProvider = useAppStore((s) => s.activeProvider)
  const setActiveProvider = useAppStore((s) => s.setActiveProvider)

  const handleSetActive = (id: AIProviderType) => {
    setActiveProvider(id)
    setDefaultProvider(id)
  }

  const defaultProvider = providers.find((p) => p.isDefault)

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
        AI PROVIDER PREFERENCES
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}
      >
        SELECT PRIMARY AI PROVIDER // CONFIGURE MODEL PARAMETERS
      </div>

      <Separator />

      {/* Active Provider Display */}
      <div
        style={{
          marginTop: '12px',
          marginBottom: '16px',
          padding: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--phosphor-dim)',
        }}
        className="corner-brackets"
      >
        <div
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          ACTIVE PROVIDER
        </div>
        <div
          className="text-glow"
          style={{
            fontSize: '14px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
          }}
        >
          {defaultProvider?.name ?? 'NONE SELECTED'}
        </div>
        <div
          style={{
            fontSize: '9px',
            color: 'var(--phosphor-dim)',
            opacity: 0.6,
            marginTop: '4px',
            textTransform: 'uppercase',
          }}
        >
          MODEL: {defaultProvider?.model ?? 'N/A'} // RUNTIME: {activeProvider}
        </div>
      </div>

      {/* Provider Selection */}
      <div
        style={{
          fontSize: '11px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        PROVIDER SELECTION
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
        {providers.map((p) => {
          const isActive = p.isDefault
          const statusMap: Record<string, 'online' | 'degraded' | 'offline' | 'unused'> = {
            unchecked: 'unused',
            checking: 'degraded',
            valid: 'online',
            invalid: 'offline',
          }

          return (
            <button
              key={p.id}
              onClick={() => handleSetActive(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: isActive ? 'var(--phosphor-faint)' : 'var(--bg-card)',
                border: `1px solid ${isActive ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
                color: isActive ? 'var(--phosphor)' : 'var(--phosphor-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '14px' }}>{isActive ? '◉' : '○'}</span>
                <div>
                  <div className={isActive ? 'text-glow' : ''}>{p.name}</div>
                  <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '2px' }}>
                    {p.model}
                  </div>
                </div>
              </div>
              <StatusIndicator status={statusMap[p.status] ?? 'unused'} />
            </button>
          )
        })}
      </div>

      <Separator />

      {/* Model Configuration */}
      <div
        style={{
          fontSize: '11px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          marginBottom: '8px',
          marginTop: '12px',
        }}
      >
        MODEL CONFIGURATION
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {providers.map((p) => (
          <div
            key={p.id}
            style={{
              padding: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--phosphor-faint)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: 'var(--phosphor-dim)',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              {p.name}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="BASE URL"
                  value={p.baseUrl}
                  onChange={(e) => updateProviderBaseUrl(p.id, e.target.value)}
                  prefix="◈"
                  style={{ fontSize: '10px' }}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="MODEL"
                  value={p.model}
                  onChange={(e) => updateProviderModel(p.id, e.target.value)}
                  prefix="▶"
                  style={{ fontSize: '10px' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NVIDIA-specific info */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--phosphor-faint)',
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ color: 'var(--phosphor)', marginBottom: '4px' }}>
          ◈ NVIDIA NEMOTRON FEATURES
        </div>
        <div>◈ CHAIN-OF-THOUGHT REASONING (ENABLE_THINKING: TRUE)</div>
        <div>◈ REASONING BUDGET: 16384 TOKENS</div>
        <div>◈ REASONING CONTENT DISPLAYED IN COLLAPSIBLE PANEL</div>
        <div>◈ STREAMING RESPONSE WITH REAL-TIME TYPEWRITER OUTPUT</div>
      </div>
    </div>
  )
}
