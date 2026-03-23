import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTargetStore } from '@/store/targetStore'
import { useAlertStore } from '@/store/alertStore'
import { useSettingsStore } from '@/store/settingsStore'
import { ScanlineOverlay, CRTVignette, NoiseOverlay } from '@/components/ui'
import { Header } from '@/components/hud/Header'
import { Footer } from '@/components/hud/Footer'
import { LeftPanel } from '@/components/panels/LeftPanel'
import { RightPanel, RightPanelToggle } from '@/components/panels/RightPanel'
import { CenterContent } from '@/components/panels/CenterContent'

function App() {
  const bootComplete = useAppStore((s) => s.bootComplete)
  const setBootComplete = useAppStore((s) => s.setBootComplete)
  const loadTargets = useTargetStore((s) => s.loadTargets)
  const loadAlerts = useAlertStore((s) => s.loadAlerts)
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const display = useSettingsStore((s) => s.display)

  // Load data from IndexedDB and settings on mount
  useEffect(() => {
    void loadTargets()
    void loadAlerts()
    loadSettings()
  }, [loadTargets, loadAlerts, loadSettings])

  // Boot sequence check
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
      {/* Visual effect overlays — controlled by display settings */}
      {display.scanlines && <ScanlineOverlay />}
      {display.crtVignette && <CRTVignette />}
      {display.noiseOverlay && <NoiseOverlay />}

      {/* HUD Header */}
      <Header />

      {/* Main content: Left Panel | Center | Right Panel */}
      <main className="flex-1 flex overflow-hidden relative">
        <LeftPanel />
        <CenterContent />
        <RightPanelToggle />
        <RightPanel />
      </main>

      {/* HUD Footer / Status Bar */}
      <Footer />
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

export default App
