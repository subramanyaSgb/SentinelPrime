import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { Panel, PanelHeader, Separator } from '@/components/ui'
import { APIKeysTab } from './APIKeysTab'
import { AIPreferencesTab } from './AIPreferencesTab'
import { OpSecTab } from './OpSecTab'
import { DataManagementTab } from './DataManagementTab'
import { DisplayTab } from './DisplayTab'

type SettingsTab = 'api-keys' | 'ai-preferences' | 'opsec' | 'data' | 'display'

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'api-keys', label: 'API KEYS', icon: '◈' },
  { id: 'ai-preferences', label: 'AI PREFERENCES', icon: '◆' },
  { id: 'opsec', label: 'OPSEC CONFIG', icon: '◉' },
  { id: 'data', label: 'DATA MANAGEMENT', icon: '▦' },
  { id: 'display', label: 'DISPLAY', icon: '◇' },
]

/**
 * Settings View — API Keys // AI Config // OpSec // Data Management // Display
 * PRD Section 6.1 — Settings subsections
 * PRD Section 13.1 — API Key Storage
 */
export function SettingsView() {
  const activeTab = useSettingsStore((s) => s.activeTab)
  const setActiveTab = useSettingsStore((s) => s.setActiveTab)
  const loadSettings = useSettingsStore((s) => s.loadSettings)

  // Load saved settings from localStorage on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ padding: '16px' }}>
      {/* Settings Header */}
      <PanelHeader
        title="SYSTEM CONFIGURATION"
        meta={['SETTINGS', 'SECURE']}
      />

      <div className="flex-1 flex gap-4 overflow-hidden" style={{ marginTop: '8px' }}>
        {/* Left: Tab Navigation */}
        <div
          style={{
            width: '200px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}

          <Separator />

          {/* Version info at bottom */}
          <div
            style={{
              fontSize: '9px',
              color: 'var(--phosphor-dim)',
              opacity: 0.4,
              textTransform: 'uppercase',
              marginTop: 'auto',
              padding: '8px 12px',
            }}
          >
            SENTINELPRIME v0.1.0
            <br />
            BUILD: PHASE 0
          </div>
        </div>

        {/* Right: Active Tab Content */}
        <div className="flex-1 overflow-y-auto" style={{ paddingRight: '4px' }}>
          <Panel active className="h-full">
            {activeTab === 'api-keys' && <APIKeysTab />}
            {activeTab === 'ai-preferences' && <AIPreferencesTab />}
            {activeTab === 'opsec' && <OpSecTab />}
            {activeTab === 'data' && <DataManagementTab />}
            {activeTab === 'display' && <DisplayTab />}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: active ? 'var(--phosphor-faint)' : 'transparent',
        border: 'none',
        borderLeft: active ? '2px solid var(--phosphor)' : '2px solid transparent',
        color: active ? 'var(--phosphor)' : 'var(--phosphor-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        width: '100%',
      }}
    >
      <span style={{ fontSize: '12px', opacity: active ? 1 : 0.5 }}>{icon}</span>
      <span className={active ? 'text-glow' : ''}>{label}</span>
    </button>
  )
}
