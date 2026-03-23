import { useState, useCallback } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { useAppStore } from '@/store/appStore'
import { Button, Input, TextArea, Separator } from '@/components/ui'
import type { TargetType, TargetIdentifier } from '@/types'

/**
 * TargetCreateForm — Create new intelligence targets.
 *
 * PRD Section 7.1: Target Manager — every investigation starts here.
 * Target Types: Person, Domain/IP, Organization, Location, Event, Generic
 *
 * Creates a target in IndexedDB via targetStore.createTarget()
 * and navigates to the target detail view.
 */

const TARGET_TYPES: { value: TargetType; label: string; icon: string; description: string }[] = [
  { value: 'person', label: 'PERSON', icon: '◈', description: 'NAME // EMAIL // PHONE // USERNAME' },
  { value: 'domain', label: 'DOMAIN/IP', icon: '◉', description: 'URL // IP ADDRESS // DOMAIN' },
  { value: 'org', label: 'ORGANIZATION', icon: '◆', description: 'COMPANY // NGO // GOVERNMENT ENTITY' },
  { value: 'location', label: 'LOCATION', icon: '◎', description: 'COORDINATES // ADDRESS // REGION' },
  { value: 'event', label: 'EVENT', icon: '▣', description: 'SPECIFIC INCIDENT UNDER INVESTIGATION' },
  { value: 'generic', label: 'GENERIC', icon: '○', description: 'CATCH-ALL FOR ANYTHING ELSE' },
]

const IDENTIFIER_TYPES = [
  'email', 'phone', 'username', 'domain', 'ip', 'url', 'wallet', 'ssn', 'passport', 'other',
]

interface TargetCreateFormProps {
  onCreated?: (targetId: string) => void
  onCancel?: () => void
}

export function TargetCreateForm({ onCreated, onCancel }: TargetCreateFormProps) {
  const createTarget = useTargetStore((s) => s.createTarget)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setActiveTargetId = useAppStore((s) => s.setActiveTargetId)

  const [name, setName] = useState('')
  const [type, setType] = useState<TargetType>('person')
  const [aliases, setAliases] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [identifiers, setIdentifiers] = useState<TargetIdentifier[]>([])
  const [newIdType, setNewIdType] = useState('email')
  const [newIdValue, setNewIdValue] = useState('')
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
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

      const target = await createTarget({
        type,
        name: name.trim(),
        aliases: aliasList,
        identifiers,
        notes: notes.trim(),
        tags: tagList,
        threatScore: 0,
        status: 'active',
        coordinates,
      })

      // Navigate to target detail
      setActiveTargetId(target.id)
      setCurrentView('target-detail')

      if (onCreated) {
        onCreated(target.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'FAILED TO CREATE TARGET')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    name, type, aliases, notes, tags, identifiers, lat, lon,
    createTarget, setActiveTargetId, setCurrentView, onCreated,
  ])

  return (
    <div style={{ maxWidth: '640px', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          fontSize: '13px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
        className="text-glow"
      >
        CREATE NEW TARGET
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}
      >
        INITIALIZE INVESTIGATION SUBJECT // ALL FIELDS ARE LOCAL-ONLY
      </div>

      <Separator />

      {/* Target Type Selector */}
      <div style={{ marginTop: '12px', marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          TARGET TYPE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {TARGET_TYPES.map((tt) => (
            <button
              key={tt.value}
              onClick={() => setType(tt.value)}
              style={{
                padding: '8px',
                background: type === tt.value ? 'var(--phosphor-faint)' : 'var(--bg-card)',
                border: `1px solid ${type === tt.value ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
                color: type === tt.value ? 'var(--phosphor)' : 'var(--phosphor-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div className={type === tt.value ? 'text-glow' : ''}>
                {tt.icon} {tt.label}
              </div>
              <div style={{ fontSize: '8px', opacity: 0.5, marginTop: '2px' }}>
                {tt.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div style={{ marginBottom: '12px' }}>
        <Input
          label="TARGET NAME"
          placeholder="ENTER PRIMARY IDENTIFIER..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          prefix=">_"
        />
      </div>

      {/* Aliases */}
      <div style={{ marginBottom: '12px' }}>
        <Input
          label="ALIASES (COMMA-SEPARATED)"
          placeholder="ALT NAMES, HANDLES, KNOWN-AS..."
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          prefix="◇"
        />
      </div>

      {/* Identifiers */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          IDENTIFIERS // {identifiers.length} ADDED
        </div>

        {/* Existing identifiers */}
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

        {/* Add new identifier */}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddIdentifier()
              }}
              prefix="+"
            />
          </div>
          <Button
            variant="default"
            onClick={handleAddIdentifier}
            disabled={!newIdValue.trim()}
            style={{ fontSize: '10px', flexShrink: 0 }}
          >
            ADD
          </Button>
        </div>
      </div>

      {/* Coordinates (optional) */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          COORDINATES (OPTIONAL) // FOR GLOBE MARKER PLACEMENT
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="LATITUDE"
              placeholder="-90 TO 90"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              prefix="◎"
            />
          </div>
          <div className="flex-1">
            <Input
              label="LONGITUDE"
              placeholder="-180 TO 180"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              prefix="◎"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '12px' }}>
        <Input
          label="TAGS (COMMA-SEPARATED)"
          placeholder="HIGH-PRIORITY, FINANCIAL, SOCIAL-MEDIA..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          prefix="▣"
        />
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '16px' }}>
        <TextArea
          label="INVESTIGATION NOTES"
          placeholder="INITIAL CONTEXT, BACKGROUND, REASON FOR INVESTIGATION..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
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
        <Button
          variant="primary"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !name.trim()}
          style={{ fontSize: '11px' }}
        >
          {isSubmitting ? '● CREATING...' : '▶ CREATE TARGET'}
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
