/**
 * RadarSweep — PRD Section 6.5
 *
 * Rotating conic-gradient behind the Three.js globe.
 * - 4 seconds per full revolution
 * - Phosphor green sweep with transparent-to-green gradient
 * - Always on — renders behind the Canvas
 * - Circular mask to keep the sweep within the globe bounds
 * - Pure CSS animation — no JS frame loop needed
 */

/**
 * RadarSweep sits behind the 3D globe canvas.
 * It renders a circular conic-gradient that rotates continuously.
 *
 * The sweep is masked to a circle so it appears as a radar disc,
 * and the gradient fades from transparent to phosphor green,
 * creating the classic radar "wiper" effect.
 */
export function RadarSweep() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Radar disc container — circular clip */}
      <div
        style={{
          position: 'relative',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        {/* Concentric ring guides */}
        <RadarRings />

        {/* Rotating sweep arm */}
        <div
          className="radar-sweep-arm"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(0, 255, 65, 0.03) 300deg, rgba(0, 255, 65, 0.08) 330deg, rgba(0, 255, 65, 0.15) 350deg, rgba(0, 255, 65, 0.25) 358deg, rgba(0, 255, 65, 0.4) 360deg)',
            animation: 'radarSweepRotate 4s linear infinite',
          }}
        />

        {/* Sweep leading edge glow line */}
        <div
          className="radar-sweep-edge"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 358deg, rgba(0, 255, 65, 0.6) 359.5deg, rgba(0, 255, 65, 0.8) 360deg)',
            animation: 'radarSweepRotate 4s linear infinite',
          }}
        />

        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--phosphor)',
            boxShadow: '0 0 6px var(--phosphor-glow), 0 0 12px var(--phosphor-glow)',
            zIndex: 2,
          }}
        />

        {/* Crosshair lines */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'var(--phosphor-faint)',
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'var(--phosphor-faint)',
            opacity: 0.15,
          }}
        />
      </div>
    </div>
  )
}

/**
 * RadarRings — concentric circle guides behind the sweep.
 * 3 rings at 33%, 66%, 100% of the radar disc radius.
 */
function RadarRings() {
  const rings = [
    { size: '33%', opacity: 0.06 },
    { size: '66%', opacity: 0.05 },
    { size: '100%', opacity: 0.04 },
  ]

  return (
    <>
      {rings.map((ring, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: ring.size,
            height: ring.size,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px solid var(--phosphor)',
            opacity: ring.opacity,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}
