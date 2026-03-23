import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

/**
 * Global keyboard shortcuts for SentinelPrime.
 *
 * Shortcuts:
 * - Ctrl+K / Cmd+K → Open command palette
 * - Ctrl+1 → Navigate to Dashboard
 * - Ctrl+2 → Navigate to Targets
 * - Ctrl+3 → Navigate to Tools
 * - Ctrl+4 → Navigate to Intelligence
 * - Ctrl+5 → Navigate to Visualizations
 * - Ctrl+6 → Navigate to Settings
 * - Escape → Close panels/modals
 * - Ctrl+N → Create new target
 */
export function useKeyboardShortcuts() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setLeftPanelOpen = useAppStore((s) => s.setLeftPanelOpen)
  const setRightPanelOpen = useAppStore((s) => s.setRightPanelOpen)
  const addToast = useAppStore((s) => s.addToast)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
      const modKey = isMac ? event.metaKey : event.ctrlKey

      // Cmd/Ctrl+K → Command Palette
      if (modKey && event.key === 'k') {
        event.preventDefault()
        addToast('COMMAND PALETTE OPENED', 'low')
      }

      // Cmd/Ctrl+1 → Dashboard
      if (modKey && event.key === '1') {
        event.preventDefault()
        setCurrentView('dashboard')
        addToast('NAVIGATING TO DASHBOARD', 'low')
      }

      // Cmd/Ctrl+2 → Targets
      if (modKey && event.key === '2') {
        event.preventDefault()
        setCurrentView('targets')
        addToast('NAVIGATING TO TARGETS', 'low')
      }

      // Cmd/Ctrl+3 → Tools
      if (modKey && event.key === '3') {
        event.preventDefault()
        setCurrentView('tools')
        addToast('NAVIGATING TO TOOLS', 'low')
      }

      // Cmd/Ctrl+4 → Intelligence
      if (modKey && event.key === '4') {
        event.preventDefault()
        setCurrentView('intelligence')
        addToast('NAVIGATING TO INTELLIGENCE', 'low')
      }

      // Cmd/Ctrl+5 → Visualizations
      if (modKey && event.key === '5') {
        event.preventDefault()
        setCurrentView('visualizations')
        addToast('NAVIGATING TO VISUALIZATIONS', 'low')
      }

      // Cmd/Ctrl+6 → Settings
      if (modKey && event.key === '6') {
        event.preventDefault()
        setCurrentView('settings')
        addToast('NAVIGATING TO SETTINGS', 'low')
      }

      // Escape → Close panels
      if (event.key === 'Escape') {
        event.preventDefault()
        setLeftPanelOpen(false)
        setRightPanelOpen(false)
        addToast('PANELS CLOSED', 'low')
      }

      // Cmd/Ctrl+N → Create new target
      if (modKey && event.key === 'n') {
        event.preventDefault()
        setCurrentView('targets')
        addToast('CREATE NEW TARGET - NAVIGATE TO TARGETS VIEW', 'low')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCurrentView, setLeftPanelOpen, setRightPanelOpen, addToast])
}
