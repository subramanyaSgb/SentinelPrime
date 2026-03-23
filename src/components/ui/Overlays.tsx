/**
 * PHANTOM GRID Visual Effect Overlays — always-on effects per PRD Section 6.5.
 *
 * Scanlines:  repeating-linear-gradient, 12% opacity
 * Noise:      SVG feTurbulence filter, 4% opacity
 * Vignette:   radial-gradient, darkens edges 20%
 */

/** Scanline overlay — horizontal lines across entire viewport */
export function ScanlineOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.12) 2px,
          rgba(0, 0, 0, 0.12) 4px
        )`,
      }}
      aria-hidden="true"
    />
  )
}

/** CRT vignette — darkens edges of screen */
export function CRTVignette() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9998,
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.2) 100%)',
      }}
      aria-hidden="true"
    />
  )
}

/** SVG Noise/grain overlay — feTurbulence filter at 4% opacity */
export function NoiseOverlay() {
  return (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9997,
        opacity: 0.04,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
  )
}

/** Red critical vignette pulse — brief red flash for critical alerts */
export function CriticalPulse({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10000,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255, 32, 32, 0.15) 100%)',
        animation: 'criticalPulse 0.2s ease-out forwards',
      }}
      aria-hidden="true"
    />
  )
}
