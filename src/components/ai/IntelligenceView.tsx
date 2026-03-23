import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTargetStore } from '@/store/targetStore'
import { Button, Separator } from '@/components/ui'
import { AIChatInterface } from './AIChatInterface'
import { CrossModuleSynthesis } from './CrossModuleSynthesis'
import { IntelReportGenerator } from './IntelReportGenerator'
import { AliasCorrelator } from './AliasCorrelator'

/**
 * IntelligenceView — Phase 5 container
 * Houses: AI Chat, Cross-Module Synthesis, Intel Reports, Alias Correlation
 */

type IntelTab = 'chat' | 'synthesis' | 'report' | 'correlation'

export function IntelligenceView() {
  const activeTargetId = useAppStore((s) => s.activeTargetId)
  const targets = useTargetStore((s) => s.targets)
  const [activeTab, setActiveTab] = useState<IntelTab>('chat')
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(activeTargetId)

  const tabs: { id: IntelTab; label: string; icon: string }[] = [
    { id: 'chat', label: 'AI ANALYST', icon: '◈' },
    { id: 'synthesis', label: 'SYNTHESIS', icon: '◆' },
    { id: 'report', label: 'INTEL REPORT', icon: '▣' },
    { id: 'correlation', label: 'ALIAS CORRELATION', icon: '◎' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px', gap: '12px' }}>
      {/* Header */}
      <div>
        <div
          style={{ fontSize: '13px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
          className="text-glow"
        >
          INTELLIGENCE CENTER
        </div>
        <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginTop: '4px' }}>
          AI ANALYSIS // SYNTHESIS // REPORTS // CORRELATION
        </div>
      </div>

      {/* Target selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', flexShrink: 0 }}>
          TARGET:
        </div>
        <select
          value={selectedTargetId ?? ''}
          onChange={(e) => setSelectedTargetId(e.target.value || null)}
          style={{
            flex: 1,
            background: 'var(--bg-deep)',
            border: '1px solid var(--phosphor-faint)',
            color: 'var(--phosphor)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            padding: '4px 8px',
            textTransform: 'uppercase',
          }}
        >
          <option value="">-- SELECT TARGET --</option>
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name.toUpperCase()} [{t.type.toUpperCase()}]
            </option>
          ))}
        </select>
      </div>

      <Separator />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontSize: '9px',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {tab.icon} {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'chat' && (
          <AIChatInterface targetId={selectedTargetId ?? undefined} />
        )}
        {activeTab === 'synthesis' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <CrossModuleSynthesis targetId={selectedTargetId ?? undefined} />
          </div>
        )}
        {activeTab === 'report' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedTargetId ? (
              <IntelReportGenerator targetId={selectedTargetId} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', opacity: 0.5 }}>
                ○ SELECT A TARGET TO GENERATE REPORT
              </div>
            )}
          </div>
        )}
        {activeTab === 'correlation' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AliasCorrelator />
          </div>
        )}
      </div>
    </div>
  )
}
