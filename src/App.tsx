import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTargetStore } from '@/store/targetStore'
import { useAlertStore } from '@/store/alertStore'
import { useSettingsStore } from '@/store/settingsStore'
import { ScanlineOverlay, CRTVignette, NoiseOverlay, CommandPalette, AlertToast } from '@/components/ui'
import { Header } from '@/components/hud/Header'
import { Footer } from '@/components/hud/Footer'
import { LeftPanel } from '@/components/panels/LeftPanel'
import { RightPanel, RightPanelToggle } from '@/components/panels/RightPanel'
import { CenterContent } from '@/components/panels/CenterContent'
import { BootSequence } from '@/components/hud/BootSequence'
import { PWAInstallPrompt } from '@/components/hud/PWAInstallPrompt'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function App() {
  const bootComplete = useAppStore((s) => s.bootComplete)
  const setBootComplete = useAppStore((s) => s.setBootComplete)
  const loadTargets = useTargetStore((s) => s.loadTargets)
  const loadAlerts = useAlertStore((s) => s.loadAlerts)
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const display = useSettingsStore((s) => s.display)

  // Register global keyboard shortcuts
  useKeyboardShortcuts()

  // Load data from IndexedDB and settings on mount
  useEffect(() => {
    void loadTargets()
    void loadAlerts()
    loadSettings()
  }, [loadTargets, loadAlerts, loadSettings])

  // Boot sequence check — skip if already booted this session or disabled in settings
  useEffect(() => {
    const skipBoot = sessionStorage.getItem('sp-boot-done') === '1'
    if (skipBoot) {
      setBootComplete(true)
      return
    }

    // Check if boot sequence is disabled in settings
    try {
      const raw = localStorage.getItem('sp-settings')
      if (raw) {
        const settings = JSON.parse(raw) as { display?: { bootSequence?: boolean } }
        if (settings.display?.bootSequence === false) {
          setBootComplete(true)
          sessionStorage.setItem('sp-boot-done', '1')
        }
      }
    } catch {
      // Settings parse failed — proceed with boot
    }
  }, [setBootComplete])

  if (!bootComplete) {
    return (
      <>
        {display.scanlines && <ScanlineOverlay />}
        <BootSequence
          onComplete={() => {
            setBootComplete(true)
            sessionStorage.setItem('sp-boot-done', '1')
          }}
        />
      </>
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

      {/* Command Palette — Ctrl+K / Cmd+K */}
      <CommandPalette />

      {/* Toast Notifications */}
      <AlertToast />

      {/* PWA Install Banner */}
      <PWAInstallPrompt />

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

export default App
