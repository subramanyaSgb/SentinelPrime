import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { ScanlineOverlay, CRTVignette, NoiseOverlay } from '@/components/ui'

function App() {
  const bootComplete = useAppStore((s) => s.bootComplete)
  const setBootComplete = useAppStore((s) => s.setBootComplete)

  useEffect(() => {
    const skipBoot = sessionStorage.getItem('sp-boot-done') === '1'
    if (skipBoot) {
      setBootComplete(true)
    }
  }, [setBootComplete])

  if (!bootComplete) {
    return (
      <BootPlaceholder
        onComplete={() => {
          setBootComplete(true)
          sessionStorage.setItem('sp-boot-done', '1')
        }}
      />
    )
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Visual effect overlays */}
      <ScanlineOverlay />
      <CRTVignette />
      <NoiseOverlay />

      {/* Header */}
      <header
        className="flex items-center justify-between px-4 border-b"
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
          <span className="ml-4 status-online">● SYSTEM NOMINAL</span>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex overflow-hidden">
        <div
          className="flex-1 flex items-center justify-center"
          style={{ background: 'var(--bg-void)' }}
        >
          <div className="text-center" style={{ color: 'var(--phosphor-dim)' }}>
            <div
              className="text-glow mb-4"
              style={{ color: 'var(--phosphor)', fontSize: '16px' }}
            >
              SENTINEL//PRIME
            </div>
            <div style={{ fontSize: '11px' }}>INTELLIGENCE PLATFORM v0.1.0</div>
            <div
              style={{
                fontSize: '10px',
                marginTop: '8px',
                color: 'var(--phosphor-dim)',
                opacity: 0.5,
              }}
            >
              PHASE 0 — FOUNDATION SCAFFOLD ACTIVE
            </div>
            <div
              style={{
                fontSize: '10px',
                marginTop: '4px',
                color: 'var(--phosphor-dim)',
                opacity: 0.3,
              }}
            >
              See Everything. Know Everything. Miss Nothing.
            </div>
          </div>
        </div>
      </main>

      {/* Footer status bar */}
      <footer
        className="flex items-center justify-between px-4 border-t"
        style={{
          height: 'var(--footer-height)',
          borderColor: 'var(--phosphor-faint)',
          background: 'var(--bg-deep)',
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
        }}
      >
        <div className="flex items-center gap-4">
          <span>◈ TARGETS: 0 ACTIVE</span>
          <span>⚠ ALERTS: 0 NEW</span>
          <span>API: ○○○○ 0/4 ONLINE</span>
        </div>
        <div className="flex items-center gap-4">
          <UptimeCounter />
          <span>MEM: --MB</span>
        </div>
      </footer>
    </div>
  )
}

/** Minimal boot placeholder — full boot sequence in Phase 0.9 */
function BootPlaceholder({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{ background: 'var(--bg-void)' }}
    >
      <div style={{ color: 'var(--phosphor)', fontSize: '12px' }} className="text-glow">
        <div>SENTINEL//PRIME INTELLIGENCE PLATFORM v0.1.0</div>
        <div style={{ color: 'var(--phosphor-dim)', marginTop: '8px' }}>
          INITIALIZING CORE SYSTEMS...
        </div>
        <div style={{ marginTop: '12px' }}>
          <span className="cursor-blink" style={{ color: 'var(--phosphor)' }}>
            LOADING
          </span>
        </div>
      </div>
    </div>
  )
}

/** Live UTC clock display */
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

/** Live uptime counter */
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

function formatUTC(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const h = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} // ${h}:${min}:${s} UTC`
}

export default App
