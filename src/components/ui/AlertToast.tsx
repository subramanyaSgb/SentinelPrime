import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import type { Toast, ToastSeverity } from '@/store/appStore'

interface AlertToastProps {
  autoDissmissDuration?: number
}

/**
 * Toast notification system following PHANTOM GRID design.
 * - Fixed position bottom-right
 * - Auto-dismiss after specified duration (default 5000ms)
 * - Severity levels: low (phosphor green), medium (amber), high (red), critical (red with glow)
 * - PHANTOM GRID styling: corner brackets, uppercase text, Share Tech Mono
 * - Stack multiple toasts
 * - Dismiss on click
 */
export function AlertToast({ autoDissmissDuration = 5000 }: AlertToastProps) {
  const toasts = useAppStore((s) => s.toasts)
  const removeToast = useAppStore((s) => s.removeToast)

  useEffect(() => {
    if (toasts.length === 0) return

    const timers: NodeJS.Timeout[] = []

    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, autoDissmissDuration)

      timers.push(timer)
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [toasts, removeToast, autoDissmissDuration])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
          isBottommost={index === toasts.length - 1}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: () => void
  isBottommost: boolean
}

function ToastItem({ toast, onDismiss, isBottommost }: ToastItemProps) {
  const getSeverityColor = (severity: ToastSeverity): string => {
    switch (severity) {
      case 'low':
        return 'var(--phosphor)'
      case 'medium':
        return 'var(--amber)'
      case 'high':
        return 'var(--red-critical)'
      case 'critical':
        return 'var(--red-critical)'
      default:
        return 'var(--phosphor)'
    }
  }

  const getSeverityLabel = (severity: ToastSeverity): string => {
    switch (severity) {
      case 'low':
        return '■'
      case 'medium':
        return '▲'
      case 'high':
        return '●'
      case 'critical':
        return '✕'
      default:
        return '■'
    }
  }

  const color = getSeverityColor(toast.severity)
  const label = getSeverityLabel(toast.severity)
  const isCritical = toast.severity === 'critical'

  return (
    <div
      className="pointer-events-auto cursor-pointer font-mono text-sm transition-all duration-300 hover:scale-105"
      onClick={onDismiss}
      style={{
        color: color,
        textShadow: isCritical ? `0 0 12px ${color}` : `0 0 6px ${color}40`,
      }}
    >
      {/* Top border */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
        }}
      >
        {/* Top-left corner bracket */}
        <span className="text-xs">◈</span>

        {/* Status indicator and message */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-lg">{label}</span>
          <span className="uppercase tracking-wider truncate">{toast.message}</span>
        </div>

        {/* Top-right corner bracket */}
        <span className="text-xs">◈</span>
      </div>

      {/* Bottom border */}
      <div
        style={{
          borderBottom: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
          height: '2px',
        }}
      />

      {/* Progress bar for bottommost toast */}
      {isBottommost && (
        <div
          className="h-1 animate-pulse"
          style={{
            background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
          }}
        />
      )}
    </div>
  )
}
