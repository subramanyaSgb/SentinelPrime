import { Suspense, lazy, Component } from 'react'
import type { ReactNode } from 'react'
import { RadarSweep } from './RadarSweep'

/**
 * GlobeLoader — Lazy-loads the Globe component with a PHANTOM GRID loading state.
 *
 * Three.js + textures are large — lazy loading keeps initial bundle small.
 * PRD Performance Budget: Three.js globe load < 2 seconds.
 *
 * Error boundary ensures that even if the Globe chunk fails to load
 * or Three.js crashes during initialization, the radar sweep and a
 * visible error message still render.
 */

const Globe = lazy(() =>
  import('./Globe').then((m) => ({ default: m.Globe }))
)

// ═══════════════════════════════════════════════════════════════
//  ERROR BOUNDARY — catches lazy load & Globe-level failures
// ═══════════════════════════════════════════════════════════════

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class GlobeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <GlobeErrorFallback />
    }
    return this.props.children
  }
}

/**
 * GlobeErrorFallback — shown when Globe component fails entirely.
 * Radar sweep still renders, plus a PHANTOM GRID error panel.
 */
function GlobeErrorFallback() {
  return (
    <div
      className="flex-1 relative"
      style={{ background: 'var(--bg-void)', minHeight: '400px' }}
    >
      {/* Radar sweep ALWAYS renders */}
      <RadarSweep />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '24px',
            border: '1px solid var(--phosphor-faint)',
            background: 'rgba(2, 8, 2, 0.85)',
            maxWidth: '360px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              color: 'var(--phosphor)',
              opacity: 0.2,
              marginBottom: '12px',
            }}
          >
            ◎
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--amber)',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            ⚠ GLOBE // INIT_FAILURE
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
              lineHeight: '1.6',
            }}
          >
            MISSION CONTROL GLOBE FAILED TO LOAD.
            <br />
            RADAR SWEEP OPERATING NORMALLY.
            <br />
            <span style={{ opacity: 0.5 }}>
              CHECK CONSOLE FOR DETAILS // RELOAD TO RETRY
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

export function GlobeLoader() {
  return (
    <GlobeErrorBoundary>
      <Suspense fallback={<GlobeLoadingState />}>
        <Globe />
      </Suspense>
    </GlobeErrorBoundary>
  )
}

function GlobeLoadingState() {
  return (
    <div
      className="flex-1 relative"
      style={{ background: 'var(--bg-void)', minHeight: '400px' }}
    >
      {/* Radar sweep visible even during loading */}
      <RadarSweep />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '24px',
              color: 'var(--phosphor)',
              opacity: 0.2,
              marginBottom: '12px',
            }}
          >
            ◎
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
            }}
          >
            <span className="cursor-blink">LOADING MISSION CONTROL</span>
          </div>
          <div
            style={{
              fontSize: '9px',
              color: 'var(--phosphor-dim)',
              opacity: 0.4,
              marginTop: '8px',
              textTransform: 'uppercase',
            }}
          >
            INITIALIZING THREE.JS // LOADING TEXTURE
          </div>
        </div>
      </div>
    </div>
  )
}
