import { useState, useEffect, useCallback } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { useAppStore } from '@/store/appStore'
import { Button, Separator, Timestamp } from '@/components/ui'
import { ThreatScoreDisplay } from './ThreatScoreDisplay'
import { TargetStatusManager } from './TargetStatusManager'
import { TargetEditForm } from './TargetEditForm'
import { TargetExport } from './TargetExport'
import { TargetMerge } from './TargetMerge'
import type { TargetType } from '@/types'

/**
 * TargetDetailView — Phase 3.3: Full target profile with all details.
 *
 * PRD Section 7.1: Target detail shows all fields, threat score,
 * identifiers, coordinates, notes, AI summary, and quick actions.
 */

const TYPE_ICONS: Record<TargetType, string> = {
  person: '◈',
  domain: '◉',
  org: '◆',
  location: '◎',
  event: '▣',
  generic: '○',
}

interface TargetDetailViewProps {
  targetId: string
  onBack: () => void
}

export function TargetDetailView({ targetId, onBack }: TargetDetailViewProps) {
  const targets = useTargetStore((s) => s.targets)
  const deleteTarget = useTargetStore((s) => s.deleteTarget)
  const setCurrentView = useAppStore((s) => s.setCurrentView)

  const [mode, setMode] = useState<'view' | 'edit' | 'merge'>('view')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const target = targets.find((t) => t.id === targetId)

  // Refresh targets on mount
  const loadTargets = useTargetStore((s) => s.loadTargets)
  useEffect(() => {
    void loadTargets()
  }, [loadTargets])

  const handleDelete = useCallback(async () => {
    await deleteTarget(targetId)
    setCurrentView('targets')
    onBack()
  }, [targetId, deleteTarget, setCurrentView, onBack])

  if (!target) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
        }}
      >
        ⚠ TARGET NOT FOUND // ID: {targetId}
      </div>
    )
  }

  if (mode === 'edit') {
    return (
      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
        <TargetEditForm targetId={targetId} onSaved={() => setMode('view')} onCancel={() => setMode('view')} />
      </div>
    )
  }

  if (mode === 'merge') {
    return (
      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
        <TargetMerge primaryTargetId={targetId} onComplete={() => setMode('view')} onCancel={() => setMode('view')} />
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      {/* Back button + header */}
      <div className="flex items-center gap-3" style={{ marginBottom: '4px' }}>
        <Button variant="ghost" onClick={onBack} style={{ fontSize: '10px' }}>
          ◁ BACK TO TARGETS
        </Button>
      </div>

      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '18px', color: 'var(--phosphor)' }}>{TYPE_ICONS[target.type]}</span>
          <div
            style={{
              fontSize: '16px',
              color: 'var(--phosphor)',
              textTransform: 'uppercase',
            }}
            className="text-glow"
          >
            {target.name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setMode('edit')} style={{ fontSize: '10px' }}>
            ◇ EDIT
          </Button>
          <Button variant="default" onClick={() => setShowExport(!showExport)} style={{ fontSize: '10px' }}>
            ▶ EXPORT
          </Button>
          <Button variant="default" onClick={() => setMode('merge')} style={{ fontSize: '10px' }}>
            ◆ MERGE
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            style={{ fontSize: '10px' }}
          >
            ✕ DELETE
          </Button>
        </div>
      </div>

      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        TYPE: {target.type.toUpperCase()} // CREATED: <Timestamp date={target.createdAt} className="" /> // UPDATED: <Timestamp date={target.updatedAt} className="" />
      </div>

      <Separator />

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            marginTop: '12px',
            marginBottom: '12px',
            padding: '12px',
            border: '1px solid var(--red-critical)',
            background: 'rgba(255, 32, 32, 0.05)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--red-critical)', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚠ CONFIRM TARGET DELETION
          </div>
          <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
            THIS ACTION IS IRREVERSIBLE. ALL TARGET DATA WILL BE PERMANENTLY REMOVED.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="danger" onClick={() => void handleDelete()} style={{ fontSize: '10px' }}>
              ✕ CONFIRM DELETE
            </Button>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} style={{ fontSize: '10px' }}>
              ◁ CANCEL
            </Button>
          </div>
        </div>
      )}

      {/* Export panel */}
      {showExport && (
        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <TargetExport target={target} />
        </div>
      )}

      {/* Status */}
      <div style={{ marginTop: '12px', marginBottom: '16px' }}>
        <TargetStatusManager targetId={target.id} currentStatus={target.status} />
      </div>

      <Separator />

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
        {/* Left: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Threat Score */}
          <ThreatScoreDisplay targetId={target.id} score={target.threatScore} editable />

          {/* Aliases */}
          <InfoSection title="ALIASES" count={target.aliases.length}>
            {target.aliases.length === 0 ? (
              <EmptyState text="NO ALIASES DEFINED" />
            ) : (
              target.aliases.map((alias, i) => (
                <div
                  key={`alias-${String(i)}`}
                  style={{
                    fontSize: '10px',
                    color: 'var(--phosphor)',
                    textTransform: 'uppercase',
                    padding: '2px 0',
                  }}
                >
                  ◇ {alias}
                </div>
              ))
            )}
          </InfoSection>

          {/* Tags */}
          <InfoSection title="TAGS" count={target.tags.length}>
            {target.tags.length === 0 ? (
              <EmptyState text="NO TAGS DEFINED" />
            ) : (
              <div className="flex flex-wrap gap-1">
                {target.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '9px',
                      color: 'var(--phosphor)',
                      border: '1px solid var(--phosphor-faint)',
                      padding: '2px 6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </InfoSection>
        </div>

        {/* Right: Identifiers + Coordinates + Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Identifiers */}
          <InfoSection title="IDENTIFIERS" count={target.identifiers.length}>
            {target.identifiers.length === 0 ? (
              <EmptyState text="NO IDENTIFIERS ADDED" />
            ) : (
              target.identifiers.map((id, idx) => (
                <div
                  key={`id-${String(idx)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '10px',
                    padding: '3px 0',
                    borderBottom: '1px solid var(--phosphor-faint)',
                    textTransform: 'uppercase',
                  }}
                >
                  <span style={{ color: 'var(--phosphor)', width: '70px', flexShrink: 0 }}>
                    {id.type}
                  </span>
                  <span style={{ color: 'var(--phosphor-dim)' }}>//</span>
                  <span style={{ color: 'var(--phosphor-dim)', wordBreak: 'break-all' }}>
                    {id.value}
                  </span>
                </div>
              ))
            )}
          </InfoSection>

          {/* Coordinates */}
          {target.coordinates && (
            <InfoSection title="COORDINATES">
              <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
                LAT: {target.coordinates.lat.toFixed(6)} // LON: {target.coordinates.lon.toFixed(6)}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', marginTop: '2px', textTransform: 'uppercase' }}>
                GLOBE MARKER ACTIVE
              </div>
            </InfoSection>
          )}

          {/* Notes */}
          <InfoSection title="INVESTIGATION NOTES">
            {!target.notes ? (
              <EmptyState text="NO NOTES RECORDED" />
            ) : (
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--phosphor-dim)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {target.notes}
              </div>
            )}
          </InfoSection>
        </div>
      </div>

      {/* AI Summary */}
      {target.aiSummary && (
        <>
          <Separator />
          <div style={{ marginTop: '16px' }}>
            <InfoSection title="AI INTELLIGENCE SUMMARY">
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--phosphor-dim)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {target.aiSummary}
              </div>
              {target.aiLastUpdated && (
                <div style={{ marginTop: '6px', fontSize: '9px', color: 'var(--phosphor-dim)', opacity: 0.5 }}>
                  LAST UPDATED: <Timestamp date={target.aiLastUpdated} className="" />
                </div>
              )}
            </InfoSection>
          </div>
        </>
      )}
    </div>
  )
}

function InfoSection({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        padding: '10px',
      }}
      className="corner-brackets"
    >
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        {title}
        {count !== undefined && (
          <span style={{ opacity: 0.5 }}> // {count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: '9px',
        color: 'var(--phosphor-dim)',
        opacity: 0.4,
        textTransform: 'uppercase',
      }}
    >
      {text}
    </div>
  )
}
