import { useState, useCallback } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button } from '@/components/ui'

/**
 * ThreatScoreDisplay — Phase 3.5: Visual threat score with adjustable slider.
 *
 * PRD Section 7.1: Threat score 0-100, color-coded,
 * ASCII progress bar, editable by operator.
 */

interface ThreatScoreDisplayProps {
  targetId: string
  score: number
  editable?: boolean
  compact?: boolean
}

export function ThreatScoreDisplay({ targetId, score, editable = false, compact = false }: ThreatScoreDisplayProps) {
  const updateTarget = useTargetStore((s) => s.updateTarget)
  const [isEditing, setIsEditing] = useState(false)
  const [localScore, setLocalScore] = useState(score)

  const threatLevel =
    score >= 80
      ? { label: 'CRITICAL', color: 'var(--red-critical)' }
      : score >= 60
        ? { label: 'HIGH', color: 'var(--amber)' }
        : score >= 40
          ? { label: 'MODERATE', color: 'var(--phosphor)' }
          : score >= 20
            ? { label: 'LOW', color: 'var(--phosphor-dim)' }
            : { label: 'MINIMAL', color: 'var(--phosphor-dim)' }

  // Build ASCII bar: 10 chars total
  const filledCount = Math.round(score / 10)
  const asciiBar = '█'.repeat(filledCount) + '░'.repeat(10 - filledCount)

  const handleSave = useCallback(async () => {
    await updateTarget(targetId, { threatScore: localScore })
    setIsEditing(false)
  }, [targetId, localScore, updateTarget])

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span style={{ fontSize: '10px', color: threatLevel.color, fontFamily: 'var(--font-mono)' }}>
          {asciiBar}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: threatLevel.color,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {score}/100 {threatLevel.label}
        </span>
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
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <div
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            textTransform: 'uppercase',
          }}
        >
          THREAT ASSESSMENT
        </div>
        {editable && !isEditing && (
          <Button variant="ghost" onClick={() => { setIsEditing(true); setLocalScore(score) }} style={{ fontSize: '9px' }}>
            ◇ ADJUST
          </Button>
        )}
      </div>

      {/* Score display */}
      <div className="flex items-center gap-3" style={{ marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '24px',
            color: threatLevel.color,
            fontFamily: 'var(--font-mono)',
            lineHeight: 1,
          }}
          className={score >= 60 ? 'text-glow' : ''}
        >
          {isEditing ? localScore : score}
        </span>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: threatLevel.color,
              textTransform: 'uppercase',
            }}
          >
            {threatLevel.label}
          </div>
          <div
            style={{
              fontSize: '9px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
              opacity: 0.6,
            }}
          >
            THREAT LEVEL
          </div>
        </div>
      </div>

      {/* ASCII bar */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '8px' }}>
        <span style={{ color: threatLevel.color }}>
          {'█'.repeat(Math.round((isEditing ? localScore : score) / 10))}
        </span>
        <span style={{ color: 'var(--phosphor-faint)' }}>
          {'░'.repeat(10 - Math.round((isEditing ? localScore : score) / 10))}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            marginLeft: '8px',
          }}
        >
          {isEditing ? localScore : score}%
        </span>
      </div>

      {/* Editable slider */}
      {isEditing && (
        <div style={{ marginTop: '8px' }}>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={localScore}
            onChange={(e) => setLocalScore(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              accentColor: threatLevel.color,
              cursor: 'pointer',
            }}
          />
          <div className="flex items-center gap-2" style={{ marginTop: '6px' }}>
            <Button variant="primary" onClick={() => void handleSave()} style={{ fontSize: '9px' }}>
              ▶ SAVE SCORE
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)} style={{ fontSize: '9px' }}>
              ✕ CANCEL
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
