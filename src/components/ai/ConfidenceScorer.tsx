import type { ToolResult } from '@/types'

/**
 * ConfidenceScorer — Phase 5.6
 * Calculates and displays confidence scores for tool results.
 * Multi-source verification increases confidence.
 */

interface ConfidenceScoreProps {
  score: number
  compact?: boolean
}

export function ConfidenceScore({ score, compact = false }: ConfidenceScoreProps) {
  const level =
    score >= 80 ? { label: 'HIGH', color: 'var(--phosphor)' } :
    score >= 60 ? { label: 'MODERATE', color: 'var(--phosphor)' } :
    score >= 40 ? { label: 'LOW', color: 'var(--amber)' } :
    { label: 'UNVERIFIED', color: 'var(--red-critical)' }

  const filledBars = Math.round(score / 10)
  const asciiBar = '█'.repeat(filledBars) + '░'.repeat(10 - filledBars)

  if (compact) {
    return (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
        <span style={{ color: level.color }}>{asciiBar}</span>
        <span style={{ color: 'var(--phosphor-dim)', marginLeft: '4px' }}>
          {score}%
        </span>
      </span>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ color: 'var(--phosphor-dim)' }}>CONFIDENCE</span>
      <span style={{ color: level.color }}>{asciiBar}</span>
      <span style={{ color: level.color }}>{score}%</span>
      <span style={{ color: 'var(--phosphor-dim)', opacity: 0.6 }}>{level.label}</span>
    </div>
  )
}

/**
 * Calculate confidence score from tool result properties.
 */
export function calculateConfidence(result: Partial<ToolResult>): number {
  let score = 0

  // Has actual data
  if (result.output && Object.keys(result.output).length > 0) score += 30

  // Has sources
  if (result.sources && result.sources.length > 0) {
    score += Math.min(result.sources.length * 15, 30)
  }

  // Has AI analysis
  if (result.aiAnalysis) score += 15

  // Has tags
  if (result.tags && result.tags.length > 0) score += 10

  // Is linked to target
  if (result.targetId) score += 15

  return Math.min(score, 100)
}
