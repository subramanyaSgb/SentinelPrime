import { type ReactNode } from 'react'

interface CardProps {
  title?: string
  meta?: string[]
  icon?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  variant?: 'default' | 'alert' | 'result'
}

/**
 * PHANTOM GRID Card — content container with corner brackets, header, and action bar.
 *
 * ```
 * ⌐─────────────────────────────────────────────────────────────¬
 *   [◈] TITLE                                       [▶ ACTION]
 *   ─────────────────────────────────────────────────────────────
 *   [content]
 *
 *   [ACTION BAR]
 * └─────────────────────────────────────────────────────────────┘
 * ```
 */
export function Card({
  title,
  meta = [],
  icon = '◈',
  actions,
  children,
  className = '',
  variant = 'default',
}: CardProps) {
  const borderColor =
    variant === 'alert'
      ? 'var(--amber-dim)'
      : variant === 'result'
        ? 'var(--phosphor-faint)'
        : 'var(--phosphor-faint)'

  return (
    <div
      className={`phantom-card corner-brackets corner-brackets-bottom ${className}`}
      style={{ borderColor }}
    >
      {title && (
        <>
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2"
              style={{
                fontSize: '12px',
                color: 'var(--phosphor)',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ opacity: 0.6 }}>[{icon}]</span>
              <span className="text-glow">{title}</span>
              {meta.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span style={{ color: 'var(--phosphor-dim)', fontSize: '10px' }}>//</span>
                  <span style={{ color: 'var(--phosphor-dim)', fontSize: '10px' }}>{item}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="phantom-separator" />
        </>
      )}

      <div style={{ marginTop: title ? '8px' : 0 }}>{children}</div>

      {actions && (
        <>
          <div className="phantom-separator" style={{ marginTop: '12px' }} />
          <div className="flex items-center gap-3" style={{ marginTop: '8px' }}>
            {actions}
          </div>
        </>
      )}
    </div>
  )
}
