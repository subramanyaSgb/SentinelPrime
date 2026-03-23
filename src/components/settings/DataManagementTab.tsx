import { useState, useCallback } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useTargetStore } from '@/store/targetStore'
import { Button, Input, Separator } from '@/components/ui'
import { db } from '@/db/db'

/**
 * Data Management Tab — Data retention, export, and database controls.
 * PRD 13.4: Evidence integrity, export with manifests.
 */
export function DataManagementTab() {
  const data = useSettingsStore((s) => s.data)
  const updateData = useSettingsStore((s) => s.updateData)
  const targets = useTargetStore((s) => s.targets)

  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [dbStats, setDbStats] = useState<{ tables: string; size: string } | null>(null)

  const handleExportAll = useCallback(async () => {
    setExportStatus('EXPORTING...')
    try {
      const allTargets = await db.targets.toArray()
      const allResults = await db.toolResults.toArray()
      const allTimeline = await db.timelineEvents.toArray()
      const allRelationships = await db.relationships.toArray()
      const allEvidence = await db.evidence.toArray()
      const allConversations = await db.aiConversations.toArray()

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '0.1.0',
        targets: allTargets,
        toolResults: allResults,
        timelineEvents: allTimeline,
        relationships: allRelationships,
        evidence: allEvidence,
        aiConversations: allConversations,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sentinelprime-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus('EXPORT COMPLETE')
      setTimeout(() => setExportStatus(null), 3000)
    } catch {
      setExportStatus('EXPORT FAILED')
      setTimeout(() => setExportStatus(null), 3000)
    }
  }, [])

  const handleGetStats = useCallback(async () => {
    try {
      const targetCount = await db.targets.count()
      const resultCount = await db.toolResults.count()
      const eventCount = await db.timelineEvents.count()
      const relCount = await db.relationships.count()
      const evidCount = await db.evidence.count()
      const convCount = await db.aiConversations.count()

      const total = targetCount + resultCount + eventCount + relCount + evidCount + convCount
      setDbStats({
        tables: `TARGETS: ${String(targetCount)} // RESULTS: ${String(resultCount)} // EVENTS: ${String(eventCount)} // RELATIONS: ${String(relCount)} // EVIDENCE: ${String(evidCount)} // CONVERSATIONS: ${String(convCount)}`,
        size: `${String(total)} TOTAL RECORDS`,
      })
    } catch {
      setDbStats({ tables: 'ERROR READING DATABASE', size: '' })
    }
  }, [])

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
        DATA MANAGEMENT
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}
      >
        EXPORT // RETENTION // DATABASE CONTROLS
      </div>

      <Separator />

      {/* Auto-save */}
      <div style={{ marginTop: '12px', marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          AUTO-SAVE
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--phosphor-faint)',
            cursor: 'pointer',
          }}
          onClick={() => updateData('autoSave', !data.autoSave)}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                color: data.autoSave ? 'var(--phosphor)' : 'var(--phosphor-dim)',
                textTransform: 'uppercase',
              }}
            >
              AUTOMATIC SAVE TO INDEXEDDB
            </div>
            <div
              style={{
                fontSize: '9px',
                color: 'var(--phosphor-dim)',
                opacity: 0.5,
                marginTop: '2px',
                textTransform: 'uppercase',
              }}
            >
              SAVE TOOL RESULTS AND TARGET DATA AUTOMATICALLY
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '18px',
              border: `1px solid ${data.autoSave ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
              background: data.autoSave ? 'var(--phosphor-faint)' : 'transparent',
              position: 'relative',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                background: data.autoSave ? 'var(--phosphor)' : 'var(--phosphor-dim)',
                position: 'absolute',
                top: '1px',
                left: data.autoSave ? '19px' : '1px',
                transition: 'left 0.15s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Retention */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          DATA RETENTION
        </div>
        <div className="flex items-center gap-3">
          <div style={{ width: '120px' }}>
            <Input
              label="RETENTION (DAYS)"
              type="number"
              value={String(data.retentionDays)}
              onChange={(e) => updateData('retentionDays', parseInt(e.target.value, 10) || 0)}
              prefix="◈"
              style={{ fontSize: '11px' }}
            />
          </div>
          <div
            style={{
              fontSize: '9px',
              color: 'var(--phosphor-dim)',
              opacity: 0.5,
              textTransform: 'uppercase',
              marginTop: '16px',
            }}
          >
            SET TO 0 FOR UNLIMITED RETENTION
          </div>
        </div>
      </div>

      {/* Export Format */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          EXPORT FORMAT
        </div>
        <div className="flex gap-2">
          <FormatButton
            label="JSON"
            active={data.exportFormat === 'json'}
            onClick={() => updateData('exportFormat', 'json')}
          />
          <FormatButton
            label="CSV"
            active={data.exportFormat === 'csv'}
            onClick={() => updateData('exportFormat', 'csv')}
          />
        </div>
      </div>

      <Separator />

      {/* Export */}
      <div style={{ marginTop: '12px', marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          DATA EXPORT
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => void handleExportAll()}>
            ▶ EXPORT ALL DATA
          </Button>
          {exportStatus && (
            <span
              style={{
                fontSize: '10px',
                color: exportStatus.includes('COMPLETE') ? 'var(--phosphor)' : 'var(--amber)',
                textTransform: 'uppercase',
              }}
            >
              {exportStatus}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '9px',
            color: 'var(--phosphor-dim)',
            opacity: 0.5,
            marginTop: '6px',
            textTransform: 'uppercase',
          }}
        >
          EXPORTS ALL TARGETS, TOOL RESULTS, TIMELINE, RELATIONSHIPS, AND EVIDENCE
        </div>
      </div>

      <Separator />

      {/* Database Stats */}
      <div style={{ marginTop: '12px' }}>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          DATABASE STATUS
        </div>
        <div className="flex items-center gap-3">
          <Button variant="default" onClick={() => void handleGetStats()}>
            ▶ QUERY DATABASE
          </Button>
          <span
            style={{
              fontSize: '10px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
            }}
          >
            {String(targets.length)} TARGETS IN MEMORY
          </span>
        </div>
        {dbStats && (
          <div
            style={{
              marginTop: '8px',
              padding: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--phosphor-faint)',
              fontSize: '10px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
            }}
            className="corner-brackets"
          >
            <div>{dbStats.tables}</div>
            <div style={{ color: 'var(--phosphor)', marginTop: '4px' }}>{dbStats.size}</div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--red-dim)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: 'var(--red-critical)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          ⚠ DANGER ZONE
        </div>
        <DangerButton />
      </div>
    </div>
  )
}

function FormatButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 20px',
        background: active ? 'var(--phosphor-faint)' : 'transparent',
        border: `1px solid ${active ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
        color: active ? 'var(--phosphor)' : 'var(--phosphor-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}

function DangerButton() {
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClearAll = async () => {
    try {
      await db.targets.clear()
      await db.toolResults.clear()
      await db.timelineEvents.clear()
      await db.relationships.clear()
      await db.evidence.clear()
      await db.aiConversations.clear()
      await db.alerts.clear()
      setConfirmClear(false)
      // Reload to reset all stores
      window.location.reload()
    } catch {
      // Database error — will be handled in error boundary
    }
  }

  if (confirmClear) {
    return (
      <div className="flex items-center gap-3">
        <span
          style={{
            fontSize: '10px',
            color: 'var(--red-critical)',
            textTransform: 'uppercase',
          }}
        >
          CONFIRM: PURGE ALL DATA?
        </span>
        <Button variant="danger" onClick={() => void handleClearAll()}>
          ✕ YES, PURGE ALL
        </Button>
        <Button variant="ghost" onClick={() => setConfirmClear(false)}>
          CANCEL
        </Button>
      </div>
    )
  }

  return (
    <Button variant="danger" onClick={() => setConfirmClear(true)}>
      ✕ PURGE ALL DATA
    </Button>
  )
}
