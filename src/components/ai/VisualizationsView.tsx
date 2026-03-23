import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTargetStore } from '@/store/targetStore'
import { Button, Separator } from '@/components/ui'
import { TimelineBuilder } from './TimelineBuilder'
import { RelationshipMapper } from './RelationshipMapper'
import { ConfidenceScore } from './ConfidenceScorer'

/**
 * VisualizationsView — Phase 5 container
 * Houses: Timeline Builder, Relationship Mapper, Confidence Overview
 */

type VizTab = 'timeline' | 'relationships' | 'confidence'

export function VisualizationsView() {
  const activeTargetId = useAppStore((s) => s.activeTargetId)
  const targets = useTargetStore((s) => s.targets)
  const [activeTab, setActiveTab] = useState<VizTab>('relationships')
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(activeTargetId)

  const tabs: { id: VizTab; label: string; icon: string }[] = [
    { id: 'relationships', label: 'RELATIONSHIP MAP', icon: '◇' },
    { id: 'timeline', label: 'TIMELINE', icon: '▣' },
    { id: 'confidence', label: 'CONFIDENCE', icon: '◎' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px', gap: '12px' }}>
      {/* Header */}
      <div>
        <div
          style={{ fontSize: '13px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
          className="text-glow"
        >
          VISUALIZATIONS
        </div>
        <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginTop: '4px' }}>
          RELATIONSHIP GRAPH // TIMELINE // CONFIDENCE ANALYSIS
        </div>
      </div>

      {/* Target selector for timeline */}
      {activeTab === 'timeline' && (
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
            <option value="">-- ALL TARGETS --</option>
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name.toUpperCase()} [{t.type.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>
      )}

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
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'relationships' && <RelationshipMapper />}
        {activeTab === 'timeline' && (
          <TimelineBuilder targetId={selectedTargetId ?? undefined} />
        )}
        {activeTab === 'confidence' && <ConfidenceOverview />}
      </div>
    </div>
  )
}

/**
 * Confidence overview — shows confidence scores for all targets
 */
function ConfidenceOverview() {
  const targets = useTargetStore((s) => s.targets)

  if (targets.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--phosphor-faint)',
          padding: '12px',
        }}
        className="corner-brackets"
      >
        <div
          style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase', marginBottom: '8px' }}
          className="text-glow"
        >
          CONFIDENCE OVERVIEW
        </div>
        <div style={{ textAlign: 'center', padding: '30px', fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', opacity: 0.5 }}>
          ○ NO TARGETS AVAILABLE
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        padding: '12px',
      }}
      className="corner-brackets"
    >
      <div
        style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase', marginBottom: '4px' }}
        className="text-glow"
      >
        CONFIDENCE OVERVIEW
      </div>
      <div
        style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '12px' }}
      >
        {targets.length} TARGETS ANALYZED
      </div>

      <Separator />

      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {targets.map((target) => {
          // Calculate data completeness as confidence proxy
          let score = 0
          if (target.name) score += 15
          if (target.identifiers.length > 0) score += Math.min(target.identifiers.length * 10, 25)
          if (target.aliases.length > 0) score += Math.min(target.aliases.length * 8, 20)
          if (target.tags.length > 0) score += 10
          if (target.notes) score += 10
          if (target.coordinates) score += 10
          if (target.aiSummary) score += 10
          score = Math.min(score, 100)

          const level =
            score >= 80 ? { label: 'HIGH', color: 'var(--phosphor)' } :
            score >= 60 ? { label: 'MODERATE', color: 'var(--phosphor)' } :
            score >= 40 ? { label: 'LOW', color: 'var(--amber)' } :
            { label: 'MINIMAL', color: 'var(--red-critical)' }

          return (
            <div
              key={target.id}
              style={{
                padding: '8px 10px',
                background: 'var(--bg-deep)',
                border: `1px solid ${level.color}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
                  {target.name}
                </div>
                <div style={{ fontSize: '9px', color: level.color, textTransform: 'uppercase' }}>
                  {level.label}
                </div>
              </div>
              <div style={{ marginTop: '4px' }}>
                <ConfidenceScore score={score} compact />
              </div>
              <div style={{ fontSize: '8px', color: 'var(--phosphor-dim)', opacity: 0.5, marginTop: '2px', textTransform: 'uppercase' }}>
                {target.identifiers.length} IDENTIFIERS // {target.aliases.length} ALIASES // {target.tags.length} TAGS
                {target.aiSummary ? ' // AI ANALYZED' : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
