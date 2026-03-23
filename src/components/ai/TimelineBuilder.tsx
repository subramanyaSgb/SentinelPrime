import { useState, useCallback } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button, Input, Separator } from '@/components/ui'

/**
 * TimelineBuilder — Phase 5.4
 * Chronological event timeline for target investigations.
 * Supports manual entry and auto-population from target data.
 */

interface TimelineEvent {
  id: string
  timestamp: Date
  title: string
  description: string
  source: string
  confidence: number
  type: 'auto' | 'manual'
}

interface TimelineBuilderProps {
  targetId?: string
}

export function TimelineBuilder({ targetId }: TimelineBuilderProps) {
  const targets = useTargetStore((s) => s.targets)
  const target = targetId ? targets.find((t) => t.id === targetId) : null

  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    const auto: TimelineEvent[] = []
    if (target) {
      auto.push({
        id: crypto.randomUUID(),
        timestamp: target.createdAt instanceof Date ? target.createdAt : new Date(target.createdAt),
        title: 'TARGET CREATED',
        description: `Target "${target.name}" added to SentinelPrime`,
        source: 'SYSTEM',
        confidence: 100,
        type: 'auto',
      })
      if (target.updatedAt && target.updatedAt !== target.createdAt) {
        auto.push({
          id: crypto.randomUUID(),
          timestamp: target.updatedAt instanceof Date ? target.updatedAt : new Date(target.updatedAt),
          title: 'TARGET UPDATED',
          description: `Target data last modified`,
          source: 'SYSTEM',
          confidence: 100,
          type: 'auto',
        })
      }
    }
    return auto.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newSource, setNewSource] = useState('')

  const handleAddEvent = useCallback(() => {
    if (!newTitle.trim() || !newDate) return

    const event: TimelineEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(newDate),
      title: newTitle.trim(),
      description: newDescription.trim(),
      source: newSource.trim() || 'MANUAL',
      confidence: 70,
      type: 'manual',
    }

    setEvents((prev) =>
      [...prev, event].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    )
    setNewTitle('')
    setNewDescription('')
    setNewDate('')
    setNewSource('')
    setShowAddForm(false)
  }, [newTitle, newDescription, newDate, newSource])

  const handleRemoveEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleExport = useCallback(() => {
    const json = JSON.stringify(events, null, 2)
    void navigator.clipboard.writeText(json)
  }, [events])

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        padding: '12px',
      }}
      className="corner-brackets"
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
        <div
          style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
          className="text-glow"
        >
          TIMELINE BUILDER
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setShowAddForm(!showAddForm)} style={{ fontSize: '9px' }}>
            + ADD EVENT
          </Button>
          <Button variant="ghost" onClick={handleExport} style={{ fontSize: '9px' }}>
            ⎘ EXPORT
          </Button>
        </div>
      </div>
      <div
        style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '12px' }}
      >
        {events.length} EVENTS
        {target && ` // TARGET: ${target.name.toUpperCase()}`}
      </div>

      <Separator />

      {/* Add event form */}
      {showAddForm && (
        <div style={{ marginTop: '12px', marginBottom: '12px', padding: '10px', background: 'var(--bg-deep)', border: '1px solid var(--phosphor-faint)' }}>
          <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
            NEW TIMELINE EVENT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Input label="DATE/TIME" type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} prefix="◎" />
            <Input label="EVENT TITLE" placeholder="WHAT HAPPENED..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} prefix=">_" />
            <Input label="DESCRIPTION" placeholder="DETAILS..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} prefix="◇" />
            <Input label="SOURCE" placeholder="WHERE FROM..." value={newSource} onChange={(e) => setNewSource(e.target.value)} prefix="▶" />
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={handleAddEvent} disabled={!newTitle.trim() || !newDate} style={{ fontSize: '9px' }}>
                + ADD EVENT
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)} style={{ fontSize: '9px' }}>
                ✕ CANCEL
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ marginTop: '12px' }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', opacity: 0.5 }}>
            ○ NO EVENTS YET // ADD EVENTS TO BUILD TIMELINE
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '20px' }}>
            {/* Vertical line */}
            <div
              style={{
                position: 'absolute',
                left: '6px',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--phosphor-faint)',
              }}
            />

            {events.map((event) => (
              <div key={event.id} style={{ position: 'relative', marginBottom: '8px' }}>
                {/* Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-17px',
                    top: '6px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: event.type === 'auto' ? 'var(--phosphor-dim)' : 'var(--phosphor)',
                    border: '1px solid var(--phosphor)',
                  }}
                />

                <div
                  style={{
                    padding: '6px 8px',
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--phosphor-faint)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase' }}>
                      {event.timestamp.toISOString().replace('T', ' // ').slice(0, 22)} UTC
                    </div>
                    {event.type === 'manual' && (
                      <button
                        onClick={() => handleRemoveEvent(event.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--red-critical)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase', marginTop: '2px' }}>
                    {event.title}
                  </div>
                  {event.description && (
                    <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', marginTop: '2px' }}>
                      {event.description}
                    </div>
                  )}
                  <div style={{ fontSize: '8px', color: 'var(--phosphor-dim)', opacity: 0.5, marginTop: '2px', textTransform: 'uppercase' }}>
                    SOURCE: {event.source} // CONFIDENCE: {event.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
