interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  suffix?: string
  variant?: 'phosphor' | 'amber' | 'red'
  showPercentage?: boolean
  className?: string
}

const FILLED = '█'
const EMPTY = '░'
const BAR_LENGTH = 10

const variantColors: Record<string, string> = {
  phosphor: 'var(--phosphor)',
  amber: 'var(--amber)',
  red: 'var(--red-critical)',
}

/**
 * PHANTOM GRID ASCII Progress Bar.
 *
 * ```
 * CONFIDENCE    ████████░░  82%
 * THREAT LVL    ██████████  HIGH
 * ```
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  suffix,
  variant = 'phosphor',
  showPercentage = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.round(Math.min(100, Math.max(0, (value / max) * 100)))
  const filledCount = Math.round((percentage / 100) * BAR_LENGTH)
  const emptyCount = BAR_LENGTH - filledCount
  const bar = FILLED.repeat(filledCount) + EMPTY.repeat(emptyCount)
  const color = variantColors[variant] ?? variantColors.phosphor

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
    >
      {label && (
        <span
          style={{
            color: 'var(--phosphor-dim)',
            textTransform: 'uppercase',
            fontSize: '10px',
            minWidth: '100px',
          }}
        >
          {label}
        </span>
      )}
      <span style={{ color, letterSpacing: '1px' }}>{bar}</span>
      {showPercentage && !suffix && (
        <span style={{ color: 'var(--white-data)', fontSize: '11px' }}>{percentage}%</span>
      )}
      {suffix && (
        <span style={{ color: 'var(--white-data)', fontSize: '11px' }}>{suffix}</span>
      )}
    </div>
  )
}

interface ThreatLevelProps {
  score: number
  className?: string
}

/**
 * Threat level display with auto-colored bar.
 * 0-30: LOW (phosphor), 31-60: MEDIUM (amber), 61-100: HIGH/CRITICAL (red)
 */
export function ThreatLevel({ score, className = '' }: ThreatLevelProps) {
  const level =
    score <= 30 ? 'LOW' : score <= 60 ? 'MEDIUM' : score <= 85 ? 'HIGH' : 'CRITICAL'
  const variant =
    score <= 30 ? 'phosphor' : score <= 60 ? 'amber' : 'red'

  return (
    <ProgressBar
      value={score}
      label="THREAT LVL"
      suffix={`${level} [${score}]`}
      variant={variant as 'phosphor' | 'amber' | 'red'}
      showPercentage={false}
      className={className}
    />
  )
}
