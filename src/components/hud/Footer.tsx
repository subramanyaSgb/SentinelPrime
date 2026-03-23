import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTargetStore } from '@/store/targetStore'
import { useAlertStore } from '@/store/alertStore'

/**
 * PHANTOM GRID Footer Status Bar — always visible bottom bar.
 *
 * ```
 * [◈ TARGETS: 12 ACTIVE]  [⚠ ALERTS: 3 NEW]  [API: ●●●○ 3/4 ONLINE]  [UP: 04:32:17]  [MEM: 42MB]
 * ```
 */
export function Footer() {
  const targets = useTargetStore((s) => s.targets)
  const unreadCount = useAlertStore((s) => s.unreadCount)
  const activeTargetCount = targets.filter((t) => t.status === 'active').length

  return (
    <footer
      className="flex items-center justify-between px-4 border-t shrink-0"
      style={{
        height: 'var(--footer-height)',
        borderColor: 'var(--phosphor-faint)',
        background: 'var(--bg-deep)',
        fontSize: '10px',
        color: 'var(--phosphor-dim)',
      }}
    >
      <div className="flex items-center gap-4">
        <span>◈ TARGETS: {activeTargetCount} ACTIVE</span>
        <span
          style={{
            color: unreadCount > 0 ? 'var(--amber)' : 'var(--phosphor-dim)',
          }}
        >
          ⚠ ALERTS: {unreadCount} NEW
        </span>
        <span>API: ○○○○ 0/4 ONLINE</span>
      </div>
      <div className="flex items-center gap-4">
        <UptimeCounter />
        <MemoryDisplay />
      </div>
    </footer>
  )
}

/** Live uptime counter: UP: HH:MM:SS */
function UptimeCounter() {
  const startTime = useAppStore((s) => s.startTime)
  const [uptime, setUptime] = useState('00:00:00')

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - startTime.getTime()
      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setUptime(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return <span>UP: {uptime}</span>
}

/** Memory usage display — uses Performance API if available */
function MemoryDisplay() {
  const [mem, setMem] = useState('--')

  useEffect(() => {
    const update = () => {
      const perf = performance as Performance & {
        memory?: { usedJSHeapSize: number }
      }
      if (perf.memory) {
        const mb = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024))
        setMem(String(mb))
      }
    }
    update()
    const interval = setInterval(update, 5000)
    return () => clearInterval(interval)
  }, [])

  return <span>MEM: {mem}MB</span>
}
