import { useEffect, useState } from 'react'
import { StatusIndicator } from '@/components/ui'

/**
 * PHANTOM GRID HUD Header — always visible top bar.
 *
 * ```
 * SENTINEL//PRIME  [v1.0]  //  OPERATOR: GHOST  //  2026-03-23 // 14:32:07 UTC
 * CLASSIFICATION: UNCLASSIFIED // PERSONAL // TLP:WHITE                [● SYSTEM NOMINAL]
 * ```
 */
export function Header() {
  return (
    <header
      className="flex items-center justify-between px-4 border-b shrink-0"
      style={{
        height: 'var(--header-height)',
        borderColor: 'var(--phosphor-faint)',
        background: 'var(--bg-deep)',
      }}
    >
      <div
        className="flex items-center gap-2 text-glow"
        style={{ color: 'var(--phosphor)', fontSize: '11px' }}
      >
        <span>SENTINEL//PRIME</span>
        <span style={{ color: 'var(--phosphor-dim)' }}>[v0.1.0]</span>
        <span style={{ color: 'var(--phosphor-dim)' }}>//</span>
        <span style={{ color: 'var(--phosphor-dim)' }}>OPERATOR: GHOST</span>
        <span style={{ color: 'var(--phosphor-dim)' }}>//</span>
        <SystemClock />
      </div>
      <div
        className="flex items-center gap-2"
        style={{ fontSize: '10px', color: 'var(--phosphor-dim)' }}
      >
        <span>CLASSIFICATION: UNCLASSIFIED</span>
        <span>//</span>
        <span>PERSONAL</span>
        <span>//</span>
        <span>TLP:WHITE</span>
        <span className="ml-4">
          <StatusIndicator status="online" label="SYSTEM NOMINAL" />
        </span>
      </div>
    </header>
  )
}

/** Live UTC clock: YYYY-MM-DD // HH:MM:SS UTC */
function SystemClock() {
  const [time, setTime] = useState(() => formatUTC(new Date()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatUTC(new Date()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return <span style={{ color: 'var(--phosphor-dim)' }}>{time}</span>
}

function formatUTC(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const h = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} // ${h}:${min}:${s} UTC`
}
