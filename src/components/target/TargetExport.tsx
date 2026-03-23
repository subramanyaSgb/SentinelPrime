import { useState, useCallback } from 'react'
import { Button } from '@/components/ui'
import type { Target } from '@/types'

/**
 * TargetExport — Phase 3.7: Export target data as JSON.
 *
 * PRD Section 7.1: Targets can be exported to JSON for
 * backup, sharing, or import into other tools.
 */

interface TargetExportProps {
  target: Target
}

export function TargetExport({ target }: TargetExportProps) {
  const [copied, setCopied] = useState(false)

  const exportData = {
    exportVersion: '1.0',
    exportDate: new Date().toISOString(),
    source: 'SENTINELPRIME',
    target: {
      id: target.id,
      type: target.type,
      name: target.name,
      aliases: target.aliases,
      identifiers: target.identifiers,
      notes: target.notes,
      tags: target.tags,
      threatScore: target.threatScore,
      status: target.status,
      coordinates: target.coordinates ?? null,
      createdAt: target.createdAt instanceof Date ? target.createdAt.toISOString() : target.createdAt,
      updatedAt: target.updatedAt instanceof Date ? target.updatedAt.toISOString() : target.updatedAt,
      aiSummary: target.aiSummary ?? null,
      aiLastUpdated: target.aiLastUpdated
        ? target.aiLastUpdated instanceof Date
          ? target.aiLastUpdated.toISOString()
          : target.aiLastUpdated
        : null,
    },
  }

  const jsonString = JSON.stringify(exportData, null, 2)

  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = jsonString
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [jsonString])

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sentinelprime-target-${target.name.toLowerCase().replace(/\s+/g, '-')}-${target.id.slice(0, 8)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [jsonString, target.name, target.id])

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
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        EXPORT TARGET DATA // JSON FORMAT
      </div>

      {/* JSON Preview */}
      <div
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid var(--phosphor-faint)',
          padding: '8px',
          maxHeight: '200px',
          overflowY: 'auto',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--phosphor-dim)',
          lineHeight: 1.5,
          whiteSpace: 'pre',
        }}
      >
        {jsonString}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
        <Button variant="primary" onClick={() => void handleCopyToClipboard()} style={{ fontSize: '10px' }}>
          {copied ? '✓ COPIED' : '◈ COPY TO CLIPBOARD'}
        </Button>
        <Button variant="default" onClick={handleDownload} style={{ fontSize: '10px' }}>
          ▶ DOWNLOAD JSON
        </Button>
        <span style={{ fontSize: '9px', color: 'var(--phosphor-dim)', opacity: 0.5, textTransform: 'uppercase' }}>
          {(new Blob([jsonString]).size / 1024).toFixed(1)}KB
        </span>
      </div>
    </div>
  )
}
