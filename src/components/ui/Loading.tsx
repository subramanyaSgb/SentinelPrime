interface LoadingProps {
  text?: string
  className?: string
}

/**
 * PHANTOM GRID Loading indicator.
 *
 * Shows scanning animation: >_ SCANNING...
 * Or AI thinking dots: ● ● ●
 */
export function Loading({ text = 'SCANNING', className = '' }: LoadingProps) {
  return (
    <div
      className={className}
      style={{
        fontSize: '12px',
        color: 'var(--phosphor)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ color: 'var(--phosphor-dim)' }}>&gt;_</span>
      <span>{text}</span>
      <span className="cursor-blink" style={{ opacity: 0.8 }}>...</span>
    </div>
  )
}

/**
 * AI thinking indicator: ● ● ● with pulsing animation.
 */
export function AIThinking({ className = '' }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        fontSize: '14px',
        color: 'var(--phosphor)',
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
      }}
    >
      <span style={{ animation: 'pulse-dot 1.4s ease-in-out infinite' }}>●</span>
      <span style={{ animation: 'pulse-dot 1.4s ease-in-out 0.2s infinite' }}>●</span>
      <span style={{ animation: 'pulse-dot 1.4s ease-in-out 0.4s infinite' }}>●</span>
    </div>
  )
}

/**
 * Inline scanning cursor for input fields.
 */
export function ScanningCursor({ className = '' }: { className?: string }) {
  return (
    <span className={className} style={{ color: 'var(--phosphor)', fontSize: '12px' }}>
      &gt;_ <span style={{ animation: 'blink-cursor 1s step-end infinite' }}>SCANNING_</span>
    </span>
  )
}
