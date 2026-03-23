import { useState, useCallback } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button, Input, TextArea, Separator } from '@/components/ui'
import type { TargetType, TargetIdentifier } from '@/types'

/**
 * TargetEditForm — Phase 3.4: Edit existing target fields.
 *
 * PRD Section 7.1: All target fields are editable.
 * Reuses the same layout as TargetCreateForm but pre-fills existing data.
 */

const TARGET_TYPES: { value: TargetType; label: string; icon: string }[] = [
  { value: 'person', label: 'PERSON', icon: '◈' },
  { value: 'domain', label: 'DOMAIN/IP', icon: '◉' },
  { value: 'org', label: 'ORGANIZATION', icon: '◆' },
  { value: 'location', label: 'LOCATION', icon: '◎' },
  { value: 'event', label: 'EVENT', icon: '▣' },
  { value: 'generic', label: 'GENERIC', icon: '○' },
]

const IDENTIFIER_TYPES = [
  'email', 'phone', 'username', 'domain', 'ip', 'url', 'wallet', 'ssn', 'passport', 'other',
]

interface TargetEditFormProps {
  targetId: string
  onSaved?: () => void
  onCancel?: () => void
}

export function TargetEditForm({ targetId, onSaved, onCancel }: TargetEditFormProps) {
  const targets = useTargetStore((s) => s.targets)
  const updateTarget = useTargetStore((s) => s.updateTarget)
  const target = targets.find((t) => t.id === targetId)

  const [name, setName] = useState(target?.name ?? '')
  const [type, setType] = useState<TargetType>(target?.type ?? 'person')
  const [aliases, setAliases] = useState(target?.aliases.join(', ') ?? '')
  const [notes, setNotes] = useState(target?.notes ?? '')
  const [tags, setTags] = useState(target?.tags.join(', ') ?? '')
  const [identifiers, setIdentifiers] = useState<TargetIdentifier[]>(target?.identifiers ?? [])
  const [newIdType, setNewIdType] = useState('email')
  const [newIdValue, setNewIdValue] = useState('')
  const [lat, setLat] = useState(target?.coordinates?.lat.toString() ?? '')
  const [lon, setLon] = useState(target?.coordinates?.lon.toString() ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddIdentifier = useCallback(() => {
    if (!newIdValue.trim()) return
    setIdentifiers((prev) => [...prev, { type: newIdType, value: newIdValue.trim() }])
    setNewIdValue('')
  }, [newIdType, newIdValue])

  const handleRemoveIdentifier = useCallback((index: number) => {
    setIdentifiers((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError('TARGET NAME IS REQUIRED')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const aliasList = aliases
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0)

      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const coordinates =
        lat.trim() && lon.trim()
          ? { lat: parseFloat(lat), lon: parseFloat(lon) }
          : undefined

      await updateTarget(targetId, {
        type,
        name: name.trim(),
        aliases: aliasList,
        identifiers,
        notes: notes.trim(),
        tags: tagList,
        coordinates,
      })

      if (onSaved) onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'FAILED TO UPDATE TARGET')
    } finally {
      setIsSubmitting(false)
    }
  }, [name, type, aliases, notes, tags, identifiers, lat, lon, targetId, updateTarget, onSaved])

  if (!target) {
    return (
      <div style={{ padding: '20px', fontSize: '11px', color: 'var(--red-critical)', textTransform: 'uppercase' }}>
        ⚠ TARGET NOT FOUND
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '640px', width: '100%' }}>
      <div
        style={{
          fontSize: '13px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
        className="text-glow"
      >
        EDIT TARGET
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}
      >
        MODIFY TARGET DATA // CHANGES SAVED TO LOCAL DATABASE
      </div>

      <Separator />

      {/* Target Type Selector */}
      <div style={{ marginTop: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
          TARGET TYPE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {TARGET_TYPES.map((tt) => (
            <button
              key={tt.value}
              onClick={() => setType(tt.value)}
              style={{
                padding: '6px 8px',
                background: type === tt.value ? 'var(--phosphor-faint)' : 'var(--bg-card)',
                border: `1px solid ${type === tt.value ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
                color: type === tt.value ? 'var(--phosphor)' : 'var(--phosphor-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span className={type === tt.value ? 'text-glow' : ''}>
                {tt.icon} {tt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div style={{ marginBottom: '12px' }}>
        <Input label="TARGET NAME" placeholder="ENTER PRIMARY IDENTIFIER..." value={name} onChange={(e) => setName(e.target.value)} prefix=">_" />
      </div>

      {/* Aliases */}
      <div style={{ marginBottom: '12px' }}>
        <Input label="ALIASES (COMMA-SEPARATED)" placeholder="ALT NAMES, HANDLES..." value={aliases} onChange={(e) => setAliases(e.target.value)} prefix="◇" />
      </div>

      {/* Identifiers */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
          IDENTIFIERS // {identifiers.length} ADDED
        </div>

        {identifiers.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            {identifiers.map((id, index) => (
              <div
                key={`${id.type}-${id.value}-${String(index)}`}
                className="flex items-center justify-between"
                style={{
                  padding: '4px 8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--phosphor-faint)',
                  marginBottom: '2px',
                  fontSize: '10px',
                  color: 'var(--phosphor-dim)',
                  textTransform: 'uppercase',
                }}
              >
                <span>
                  <span style={{ color: 'var(--phosphor)' }}>{id.type}</span>
                  {' // '}
                  {id.value}
                </span>
                <button
                  onClick={() => handleRemoveIdentifier(index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--red-critical)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div style={{ width: '120px' }}>
            <select
              value={newIdType}
              onChange={(e) => setNewIdType(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'var(--bg-card)',
                border: '1px solid var(--phosphor-faint)',
                color: 'var(--phosphor)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                textTransform: 'uppercase',
              }}
            >
              {IDENTIFIER_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: 'var(--bg-deep)' }}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Input
              placeholder="IDENTIFIER VALUE..."
              value={newIdValue}
              onChange={(e) => setNewIdValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddIdentifier() }}
              prefix="+"
            />
          </div>
          <Button variant="default" onClick={handleAddIdentifier} disabled={!newIdValue.trim()} style={{ fontSize: '10px', flexShrink: 0 }}>
            ADD
          </Button>
        </div>
      </div>

      {/* Coordinates */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
          COORDINATES (OPTIONAL)
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input label="LATITUDE" placeholder="-90 TO 90" value={lat} onChange={(e) => setLat(e.target.value)} prefix="◎" />
          </div>
          <div className="flex-1">
            <Input label="LONGITUDE" placeholder="-180 TO 180" value={lon} onChange={(e) => setLon(e.target.value)} prefix="◎" />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '12px' }}>
        <Input label="TAGS (COMMA-SEPARATED)" placeholder="HIGH-PRIORITY, FINANCIAL..." value={tags} onChange={(e) => setTags(e.target.value)} prefix="▣" />
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '16px' }}>
        <TextArea label="INVESTIGATION NOTES" placeholder="CONTEXT, BACKGROUND..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '12px',
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

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => void handleSubmit()} disabled={isSubmitting || !name.trim()} style={{ fontSize: '11px' }}>
          {isSubmitting ? '● SAVING...' : '▶ SAVE CHANGES'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} style={{ fontSize: '10px' }}>
            ✕ CANCEL
          </Button>
        )}
      </div>
    </div>
  )
}
