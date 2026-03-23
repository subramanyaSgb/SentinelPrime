import { type ReactNode } from 'react'

/* ═══════════════════════════════════════════════════════════
   PHANTOM GRID Display Utilities
   Label, Value, Separator, Timestamp, MetaRow
   ═══════════════════════════════════════════════════════════ */

interface LabelProps {
  children: ReactNode
  className?: string
}

/** Field label — 10px uppercase phosphor-dim */
export function Label({ children, className = '' }: LabelProps) {
  return (
    <span
      className={`phantom-label ${className}`}
      style={{
        fontSize: '10px',
        color: 'var(--phosphor-dim)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}
    >
      {children}
    </span>
  )
}

interface ValueProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'amber' | 'red' | 'muted'
}

/** Data value display — 13px white-data */
export function Value({ children, className = '', variant = 'default' }: ValueProps) {
  const colorMap: Record<string, string> = {
    default: 'var(--white-data)',
    amber: 'var(--amber)',
    red: 'var(--red-critical)',
    muted: 'var(--phosphor-muted)',
  }

  return (
    <span
      className={`phantom-value ${className}`}
      style={{ fontSize: '13px', color: colorMap[variant] }}
    >
      {children}
    </span>
  )
}

/** Horizontal separator line */
export function Separator({ className = '' }: { className?: string }) {
  return <hr className={`phantom-separator ${className}`} />
}

interface TimestampProps {
  date: Date
  className?: string
}

/** Formatted timestamp: YYYY-MM-DD // HH:MM:SS UTC */
export function Timestamp({ date, className = '' }: TimestampProps) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const h = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')

  return (
    <span
      className={className}
      style={{ fontSize: '10px', color: 'var(--phosphor-muted)' }}
    >
      {y}-{m}-{d} // {h}:{min}:{s} UTC
    </span>
  )
}

interface MetaRowProps {
  items: string[]
  className?: string
}

/** Inline metadata row separated by // */
export function MetaRow({ items, className = '' }: MetaRowProps) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      style={{ fontSize: '10px', color: 'var(--phosphor-dim)' }}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span style={{ opacity: 0.5 }}>//</span>}
          <span style={{ textTransform: 'uppercase' }}>{item}</span>
        </span>
      ))}
    </div>
  )
}

interface DataFieldProps {
  label: string
  value: ReactNode
  className?: string
}

/** Label + value pair on a single line */
export function DataField({ label, value, className = '' }: DataFieldProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </div>
  )
}
