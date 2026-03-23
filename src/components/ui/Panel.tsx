import { type ReactNode } from 'react'

interface PanelProps {
  title?: string
  subtitle?: string
  children: ReactNode
  active?: boolean
  className?: string
}

/**
 * PHANTOM GRID Panel — bordered container with corner brackets and optional header.
 *
 * ```
 * ⌐─────────────────────────────────────────¬
 *   PANEL TITLE  //  SUBTITLE
 *   ─────────────────────────────────────────
 *   [content]
 * └─────────────────────────────────────────┘
 * ```
 */
export function Panel({ title, subtitle, children, active = false, className = '' }: PanelProps) {
  return (
    <div
      className={`phantom-panel corner-brackets corner-brackets-bottom ${active ? 'active' : ''} ${className}`}
      style={{ padding: '12px 16px' }}
    >
      {title && (
        <>
          <div
            className="flex items-center gap-2 text-glow"
            style={{
              fontSize: '13px',
              color: 'var(--phosphor)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <span>{title}</span>
            {subtitle && (
              <>
                <span style={{ color: 'var(--phosphor-dim)' }}>//</span>
                <span style={{ color: 'var(--phosphor-dim)', fontSize: '11px' }}>{subtitle}</span>
              </>
            )}
          </div>
          <div className="phantom-separator" style={{ margin: '8px 0' }} />
        </>
      )}
      {children}
    </div>
  )
}

interface PanelHeaderProps {
  title: string
  meta?: string[]
  rightContent?: ReactNode
}

/**
 * Standalone panel header row with // separated metadata.
 */
export function PanelHeader({ title, meta = [], rightContent }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
      <div
        className="flex items-center gap-2 text-glow"
        style={{
          fontSize: '11px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
        }}
      >
        <span>{title}</span>
        {meta.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span style={{ color: 'var(--phosphor-dim)' }}>//</span>
            <span style={{ color: 'var(--phosphor-dim)' }}>{item}</span>
          </span>
        ))}
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  )
}
