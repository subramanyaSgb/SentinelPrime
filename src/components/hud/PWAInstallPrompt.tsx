import { usePWAInstall } from '@/hooks/usePWAInstall'
import { Button } from '@/components/ui'

/**
 * PWA Install Prompt Banner — PRD Section 14.1
 *
 * Shows a slim banner at the top of the app when the PWA
 * is installable. Can be dismissed or used to trigger install.
 * PHANTOM GRID styled.
 */
export function PWAInstallPrompt() {
  const { isInstallable, promptInstall, dismissInstall } = usePWAInstall()

  if (!isInstallable) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--phosphor-faint)',
        fontSize: '10px',
        color: 'var(--phosphor-dim)',
        textTransform: 'uppercase',
        zIndex: 100,
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--phosphor)' }}>◈</span>
        <span>INSTALL SENTINELPRIME AS A DESKTOP APPLICATION FOR OFFLINE ACCESS</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          onClick={() => void promptInstall()}
          style={{ fontSize: '9px', padding: '3px 12px' }}
        >
          ▶ INSTALL
        </Button>
        <Button
          variant="ghost"
          onClick={dismissInstall}
          style={{ fontSize: '9px', padding: '3px 8px' }}
        >
          ✕
        </Button>
      </div>
    </div>
  )
}
