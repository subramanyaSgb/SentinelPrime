import { useState, useCallback, useMemo } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button, Input, Separator, StatusIndicator } from '@/components/ui'
import type { Target, TargetType, TargetIdentifier } from '@/types'

/**
 * TargetMerge — Phase 3.8: Merge two targets into one.
 *
 * PRD Section 7.1: Target merge functionality — combine two targets
 * when they are discovered to be the same entity. Merges aliases,
 * identifiers, tags, notes, and takes the higher threat score.
 */

const TYPE_ICONS: Record<TargetType, string> = {
  person: '◈',
  domain: '◉',
  org: '◆',
  location: '◎',
  event: '▣',
  generic: '○',
}

interface TargetMergeProps {
  primaryTargetId: string
  onComplete?: () => void
  onCancel?: () => void
}

export function TargetMerge({ primaryTargetId, onComplete, onCancel }: TargetMergeProps) {
  const targets = useTargetStore((s) => s.targets)
  const updateTarget = useTargetStore((s) => s.updateTarget)
  const deleteTarget = useTargetStore((s) => s.deleteTarget)

  const primaryTarget = targets.find((t) => t.id === primaryTargetId)
  const [search, setSearch] = useState('')
  const [selectedSecondaryId, setSelectedSecondaryId] = useState<string | null>(null)
  const [isMerging, setIsMerging] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter eligible merge targets (not the primary, not resolved)
  const mergeCandidates = useMemo(() => {
    return targets.filter((t) => {
      if (t.id === primaryTargetId) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          t.name.toLowerCase().includes(q) ||
          t.aliases.some((a) => a.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [targets, primaryTargetId, search])

  const secondaryTarget = selectedSecondaryId
    ? targets.find((t) => t.id === selectedSecondaryId)
    : null

  const handleMerge = useCallback(async () => {
    if (!primaryTarget || !secondaryTarget) return

    setIsMerging(true)
    setError(null)

    try {
      // Merge aliases (deduplicate)
      const mergedAliases = Array.from(
        new Set([
          ...primaryTarget.aliases,
          ...secondaryTarget.aliases,
          secondaryTarget.name, // Add secondary name as an alias
        ])
      ).filter((a) => a !== primaryTarget.name) // Don't include primary name as alias

      // Merge identifiers (deduplicate by type+value)
      const idKey = (id: TargetIdentifier) => `${id.type}:${id.value}`
      const seenIds = new Set(primaryTarget.identifiers.map(idKey))
      const mergedIdentifiers = [...primaryTarget.identifiers]
      for (const id of secondaryTarget.identifiers) {
        if (!seenIds.has(idKey(id))) {
          mergedIdentifiers.push(id)
          seenIds.add(idKey(id))
        }
      }

      // Merge tags (deduplicate)
      const mergedTags = Array.from(new Set([...primaryTarget.tags, ...secondaryTarget.tags]))

      // Merge notes
      const mergedNotes = [primaryTarget.notes, secondaryTarget.notes]
        .filter((n) => n.length > 0)
        .join('\n\n--- MERGED FROM: ' + secondaryTarget.name + ' ---\n\n')

      // Take higher threat score
      const mergedThreatScore = Math.max(primaryTarget.threatScore, secondaryTarget.threatScore)

      // Prefer primary's coordinates, fallback to secondary's
      const mergedCoordinates = primaryTarget.coordinates ?? secondaryTarget.coordinates

      await updateTarget(primaryTargetId, {
        aliases: mergedAliases,
        identifiers: mergedIdentifiers,
        tags: mergedTags,
        notes: mergedNotes,
        threatScore: mergedThreatScore,
        coordinates: mergedCoordinates,
      })

      // Delete the secondary target
      await deleteTarget(secondaryTarget.id)

      if (onComplete) onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MERGE FAILED')
    } finally {
      setIsMerging(false)
    }
  }, [primaryTarget, secondaryTarget, primaryTargetId, updateTarget, deleteTarget, onComplete])

  if (!primaryTarget) {
    return (
      <div style={{ fontSize: '11px', color: 'var(--red-critical)', textTransform: 'uppercase', padding: '20px' }}>
        ⚠ PRIMARY TARGET NOT FOUND
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '640px', width: '100%' }}>
      <div
        style={{ fontSize: '13px', color: 'var(--phosphor)', textTransform: 'uppercase', marginBottom: '4px' }}
        className="text-glow"
      >
        MERGE TARGETS
      </div>
      <div
        style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '16px' }}
      >
        COMBINE TWO TARGETS INTO ONE // SECONDARY TARGET WILL BE DELETED
      </div>

      <Separator />

      {/* Primary target display */}
      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
          PRIMARY TARGET (KEEP)
        </div>
        <TargetCard target={primaryTarget} />
      </div>

      <div
        style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--phosphor-dim)',
          padding: '4px 0',
        }}
      >
        ▼ MERGE INTO ▲
      </div>

      {/* Secondary target selection */}
      <div style={{ marginTop: '4px', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
          SECONDARY TARGET (DELETE AFTER MERGE)
        </div>

        {!selectedSecondaryId ? (
          <>
            <div style={{ marginBottom: '8px' }}>
              <Input
                placeholder="SEARCH FOR TARGET TO MERGE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                prefix=">_"
              />
            </div>
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {mergeCandidates.length === 0 ? (
                <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', opacity: 0.5, textTransform: 'uppercase', padding: '12px', textAlign: 'center' }}>
                  {targets.length <= 1
                    ? 'NO OTHER TARGETS AVAILABLE FOR MERGING'
                    : 'NO TARGETS MATCH SEARCH'}
                </div>
              ) : (
                mergeCandidates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedSecondaryId(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--phosphor-faint)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--phosphor-dim)',
                      textTransform: 'uppercase',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span style={{ color: 'var(--phosphor)' }}>{TYPE_ICONS[t.type]}</span>
                    <span style={{ color: 'var(--phosphor)' }}>{t.name}</span>
                    {t.aliases.length > 0 && (
                      <span style={{ opacity: 0.5 }}>AKA: {t.aliases[0]}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        ) : secondaryTarget ? (
          <div>
            <TargetCard target={secondaryTarget} />
            <Button
              variant="ghost"
              onClick={() => { setSelectedSecondaryId(null); setShowConfirm(false) }}
              style={{ fontSize: '9px', marginTop: '4px' }}
            >
              ◁ CHOOSE DIFFERENT TARGET
            </Button>
          </div>
        ) : null}
      </div>

      {/* Merge preview */}
      {secondaryTarget && !showConfirm && (
        <div style={{ marginTop: '12px' }}>
          <Separator />
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
              MERGE PREVIEW
            </div>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--phosphor-faint)',
                padding: '10px',
                fontSize: '9px',
                color: 'var(--phosphor-dim)',
                textTransform: 'uppercase',
              }}
            >
              <div>◈ ALIASES: {primaryTarget.aliases.length} + {secondaryTarget.aliases.length} + 1 (SECONDARY NAME)</div>
              <div>◈ IDENTIFIERS: {primaryTarget.identifiers.length} + {secondaryTarget.identifiers.length} (DEDUPLICATED)</div>
              <div>◈ TAGS: {primaryTarget.tags.length} + {secondaryTarget.tags.length} (DEDUPLICATED)</div>
              <div>◈ THREAT SCORE: MAX({primaryTarget.threatScore}, {secondaryTarget.threatScore}) = {Math.max(primaryTarget.threatScore, secondaryTarget.threatScore)}</div>
              <div>◈ NOTES: CONCATENATED WITH SEPARATOR</div>
              <div>◈ COORDINATES: {primaryTarget.coordinates ? 'PRIMARY' : secondaryTarget.coordinates ? 'SECONDARY' : 'NONE'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '12px' }}>
            <Button variant="primary" onClick={() => setShowConfirm(true)} style={{ fontSize: '10px' }}>
              ▶ PROCEED WITH MERGE
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} style={{ fontSize: '10px' }}>
                ✕ CANCEL
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation */}
      {showConfirm && secondaryTarget && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            border: '1px solid var(--amber)',
            background: 'rgba(255, 183, 0, 0.05)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚠ CONFIRM MERGE OPERATION
          </div>
          <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
            TARGET "{secondaryTarget.name}" WILL BE PERMANENTLY DELETED AFTER MERGE.
            ALL DATA WILL BE ABSORBED INTO "{primaryTarget.name}".
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={() => void handleMerge()} disabled={isMerging} style={{ fontSize: '10px' }}>
              {isMerging ? '● MERGING...' : '▶ CONFIRM MERGE'}
            </Button>
            <Button variant="ghost" onClick={() => setShowConfirm(false)} style={{ fontSize: '10px' }}>
              ◁ BACK
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            border: '1px solid var(--red-critical)',
            background: 'rgba(255, 32, 32, 0.05)',
            fontSize: '10px',
            color: 'var(--red-critical)',
            textTransform: 'uppercase',
          }}
        >
          ⚠ {error}
        </div>
      )}
    </div>
  )
}

function TargetCard({ target }: { target: Target }) {
  return (
    <div
      style={{
        padding: '8px 10px',
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
      }}
      className="corner-brackets"
    >
      <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--phosphor)' }}>{TYPE_ICONS[target.type]}</span>
        <span style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
          {target.name}
        </span>
        <StatusIndicator
          status={target.status === 'active' ? 'online' : target.status === 'archived' ? 'degraded' : 'offline'}
          label={target.status.toUpperCase()}
        />
      </div>
      <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', opacity: 0.6 }}>
        {target.identifiers.length} IDENTIFIERS // {target.aliases.length} ALIASES // {target.tags.length} TAGS // THREAT: {target.threatScore}/100
      </div>
    </div>
  )
}
