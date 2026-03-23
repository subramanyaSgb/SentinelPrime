import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for PWA install prompt management.
 * PRD 14.1: Custom install prompt on supported browsers.
 *
 * Captures the `beforeinstallprompt` event and provides
 * a function to trigger the native install dialog.
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

interface UsePWAInstallReturn {
  isInstallable: boolean
  isInstalled: boolean
  promptInstall: () => Promise<void>
  dismissInstall: () => void
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Check if user previously dismissed
    const dismissed = sessionStorage.getItem('sp-pwa-dismissed') === '1'
    if (dismissed) {
      setIsDismissed(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
  }, [deferredPrompt])

  const dismissInstall = useCallback(() => {
    setIsDismissed(true)
    sessionStorage.setItem('sp-pwa-dismissed', '1')
  }, [])

  return {
    isInstallable: deferredPrompt !== null && !isDismissed && !isInstalled,
    isInstalled,
    promptInstall,
    dismissInstall,
  }
}
