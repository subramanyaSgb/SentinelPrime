import { useState, useCallback } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button, Separator } from '@/components/ui'

/**
 * IntelReportGenerator — Phase 5.3
 * Generates structured intelligence reports for a target.
 * Compiles all available data into a formatted report.
 */

interface IntelReportGeneratorProps {
  targetId: string
}

export function IntelReportGenerator({ targetId }: IntelReportGeneratorProps) {
  const targets = useTargetStore((s) => s.targets)
  const target = targets.find((t) => t.id === targetId)
  const [copied, setCopied] = useState(false)

  const generateReport = useCallback(() => {
    if (!target) return ''

    const now = new Date()
    const timestamp = now.toISOString().replace('T', ' // ').slice(0, 22) + ' UTC'

    const threatLevel =
      target.threatScore >= 80 ? 'CRITICAL' :
      target.threatScore >= 60 ? 'HIGH' :
      target.threatScore >= 40 ? 'MODERATE' :
      target.threatScore >= 20 ? 'LOW' : 'MINIMAL'

    const report = `
════════════════════════════════════════════════════════════════
  SENTINELPRIME INTELLIGENCE REPORT
  CLASSIFICATION: UNCLASSIFIED // FOR OFFICIAL USE ONLY
════════════════════════════════════════════════════════════════

REPORT ID:        RPT-${target.id.slice(0, 8).toUpperCase()}
GENERATED:        ${timestamp}
TARGET:           ${target.name.toUpperCase()}
TARGET TYPE:      ${target.type.toUpperCase()}
STATUS:           ${target.status.toUpperCase()}
THREAT LEVEL:     ${'█'.repeat(Math.round(target.threatScore / 10))}${'░'.repeat(10 - Math.round(target.threatScore / 10))} ${threatLevel} [${String(target.threatScore)}/100]

────────────────────────────────────────────────────────────────
  1. SUBJECT IDENTIFICATION
────────────────────────────────────────────────────────────────

  PRIMARY NAME:     ${target.name.toUpperCase()}
  ALIASES:          ${target.aliases.length > 0 ? target.aliases.map(a => a.toUpperCase()).join(', ') : 'NONE RECORDED'}
  TAGS:             ${target.tags.length > 0 ? target.tags.join(', ').toUpperCase() : 'NONE'}

────────────────────────────────────────────────────────────────
  2. KNOWN IDENTIFIERS
────────────────────────────────────────────────────────────────

${target.identifiers.length > 0
  ? target.identifiers.map(id => `  ${id.type.toUpperCase().padEnd(15)} ${id.value}`).join('\n')
  : '  NO IDENTIFIERS ON FILE'}

${target.coordinates ? `
────────────────────────────────────────────────────────────────
  3. GEOGRAPHIC DATA
────────────────────────────────────────────────────────────────

  LATITUDE:         ${String(target.coordinates.lat)}
  LONGITUDE:        ${String(target.coordinates.lon)}
  GLOBE MARKER:     ACTIVE
` : ''}
────────────────────────────────────────────────────────────────
  4. INVESTIGATION NOTES
────────────────────────────────────────────────────────────────

${target.notes || '  NO NOTES RECORDED'}

${target.aiSummary ? `
────────────────────────────────────────────────────────────────
  5. AI INTELLIGENCE ASSESSMENT
────────────────────────────────────────────────────────────────

${target.aiSummary}
` : ''}
────────────────────────────────────────────────────────────────
  METADATA
────────────────────────────────────────────────────────────────

  CREATED:          ${target.createdAt instanceof Date ? target.createdAt.toISOString() : String(target.createdAt)}
  LAST UPDATED:     ${target.updatedAt instanceof Date ? target.updatedAt.toISOString() : String(target.updatedAt)}
  REPORT GENERATED: ${now.toISOString()}

════════════════════════════════════════════════════════════════
  END OF REPORT // SENTINELPRIME INTELLIGENCE PLATFORM
════════════════════════════════════════════════════════════════
`.trim()

    return report
  }, [target])

  const handleCopy = useCallback(() => {
    const report = generateReport()
    void navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generateReport])

  const handleDownload = useCallback(() => {
    const report = generateReport()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sentinelprime-report-${target?.name.toLowerCase().replace(/\s+/g, '-') ?? 'unknown'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generateReport, target?.name])

  if (!target) {
    return (
      <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', padding: '20px' }}>
        ○ SELECT A TARGET TO GENERATE REPORT
      </div>
    )
  }

  const report = generateReport()

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        padding: '12px',
      }}
      className="corner-brackets"
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <div
          style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
          className="text-glow"
        >
          INTELLIGENCE REPORT
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={handleCopy} style={{ fontSize: '9px' }}>
            {copied ? '✓ COPIED' : '⎘ COPY'}
          </Button>
          <Button variant="default" onClick={handleDownload} style={{ fontSize: '9px' }}>
            ▶ DOWNLOAD
          </Button>
        </div>
      </div>

      <Separator />

      <div
        style={{
          marginTop: '8px',
          background: 'var(--bg-deep)',
          border: '1px solid var(--phosphor-faint)',
          padding: '12px',
          maxHeight: '500px',
          overflowY: 'auto',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--phosphor)',
          whiteSpace: 'pre',
          lineHeight: 1.5,
        }}
      >
        {report}
      </div>
    </div>
  )
}
