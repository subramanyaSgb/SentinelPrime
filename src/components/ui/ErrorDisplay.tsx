import { Timestamp } from './Display'
import { Button } from './Button'

type ErrorCategory =
  | 'API_TIMEOUT'
  | 'API_ERROR'
  | 'RATE_LIMITED'
  | 'PARSE_ERROR'
  | 'NETWORK_ERROR'
  | 'AI_OFFLINE'
  | 'DB_ERROR'
  | 'VALIDATION_ERROR'

interface ErrorDisplayProps {
  category: ErrorCategory
  module: string
  message: string
  fallback?: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

/**
 * PHANTOM GRID Error Display — formatted error card per CLAUDE.md Section 7.
 *
 * ```
 * ⌐─────────────────────────────────────────────────────────────¬
 *   ⚠ ERROR // EMAIL_PROFILER // 2026-03-23 // 14:32:07 UTC
 *   ─────────────────────────────────────────────────────────────
 *   API_TIMEOUT: HAVEIBEENPWNED DID NOT RESPOND WITHIN 10S
 *   FALLBACK: ATTEMPTING SECONDARY SOURCE...
 *
 *   [▶ RETRY]  [✕ DISMISS]
 * └─────────────────────────────────────────────────────────────┘
 * ```
 */
export function ErrorDisplay({
  category,
  module,
  message,
  fallback,
  onRetry,
  onDismiss,
  className = '',
}: ErrorDisplayProps) {
  const now = new Date()

  return (
    <div
      className={`phantom-card corner-brackets corner-brackets-bottom ${className}`}
      style={{ borderColor: 'var(--amber-dim)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2"
        style={{ fontSize: '11px', color: 'var(--amber)' }}
      >
        <span>⚠ ERROR</span>
        <span style={{ opacity: 0.5 }}>//</span>
        <span style={{ textTransform: 'uppercase' }}>{module}</span>
        <span style={{ opacity: 0.5 }}>//</span>
        <Timestamp date={now} />
      </div>

      <div className="phantom-separator" style={{ borderColor: 'var(--amber-dim)' }} />

      {/* Error message */}
      <div style={{ marginTop: '8px' }}>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--amber)',
            textTransform: 'uppercase',
          }}
        >
          {category}: {message}
        </div>
        {fallback && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--phosphor-dim)',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            FALLBACK: {fallback}
          </div>
        )}
      </div>

      {/* Actions */}
      {(onRetry || onDismiss) && (
        <div className="flex items-center gap-3" style={{ marginTop: '12px' }}>
          {onRetry && (
            <Button variant="default" onClick={onRetry}>
              ▶ RETRY
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" onClick={onDismiss}>
              ✕ DISMISS
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

interface RateLimitDisplayProps {
  module: string
  cooldownSeconds: number
  onDismiss?: () => void
  className?: string
}

/**
 * Rate limit error with countdown timer.
 */
export function RateLimitDisplay({
  module,
  cooldownSeconds,
  onDismiss,
  className = '',
}: RateLimitDisplayProps) {
  return (
    <ErrorDisplay
      category="RATE_LIMITED"
      module={module}
      message={`RATE LIMIT EXCEEDED. COOLDOWN: ${cooldownSeconds}S`}
      fallback="WAITING FOR RATE LIMIT WINDOW TO RESET..."
      onDismiss={onDismiss}
      className={className}
    />
  )
}
