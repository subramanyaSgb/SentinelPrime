type StatusType = 'online' | 'degraded' | 'offline' | 'unused'

interface StatusIndicatorProps {
  status: StatusType
  label?: string
  className?: string
}

const statusConfig: Record<StatusType, { char: string; className: string; color: string }> = {
  online: { char: '●', className: 'status-online', color: 'var(--phosphor)' },
  degraded: { char: '●', className: 'status-degraded', color: 'var(--amber)' },
  offline: { char: '●', className: 'status-offline', color: 'var(--red-critical)' },
  unused: { char: '○', className: 'status-unused', color: 'var(--phosphor-dim)' },
}

/**
 * PHANTOM GRID Status Indicator.
 *
 * ```
 * ● ONLINE    (green pulse)
 * ● DEGRADED  (amber pulse)
 * ● OFFLINE   (red, no pulse)
 * ○ UNUSED    (dim, no pulse)
 * ```
 */
export function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`${config.className} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '10px',
        color: config.color,
      }}
    >
      <span>{config.char}</span>
      {label && <span style={{ textTransform: 'uppercase' }}>{label}</span>}
    </span>
  )
}

interface APIStatusBarProps {
  statuses: StatusType[]
  className?: string
}

/**
 * Compact API status dot row: ●●●○ 3/4 ONLINE
 */
export function APIStatusBar({ statuses, className = '' }: APIStatusBarProps) {
  const onlineCount = statuses.filter((s) => s === 'online').length
  const total = statuses.length

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        color: 'var(--phosphor-dim)',
      }}
    >
      <span>API:</span>
      <span style={{ letterSpacing: '1px' }}>
        {statuses.map((s, i) => (
          <span key={i} style={{ color: statusConfig[s].color }}>
            {statusConfig[s].char}
          </span>
        ))}
      </span>
      <span>
        {onlineCount}/{total} ONLINE
      </span>
    </span>
  )
}
