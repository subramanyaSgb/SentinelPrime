import { useAppStore } from '@/store/appStore'
import type { GlobeLayerKey } from '@/store/appStore'

/**
 * LayerToggles — Globe data layer toggle controls for the Left Panel.
 *
 * PRD Section 6.6: "Globe Layers (all toggleable from left panel)"
 * Shows toggle switches for each globe layer with status indicators.
 *
 * Layers not yet built (CCTV Mesh, Weather Radar, Earthquake Activity)
 * show as disabled with an "OFFLINE" status badge.
 */

interface LayerConfig {
  key: GlobeLayerKey
  label: string
  icon: string
  description: string
  /** Whether the layer component has been built */
  implemented: boolean
}

const LAYER_CONFIGS: LayerConfig[] = [
  {
    key: 'targetMarkers',
    label: 'TARGET MARKERS',
    icon: '🎯',
    description: 'PULSING MARKERS AT TARGET COORDINATES',
    implemented: true,
  },
  {
    key: 'satelliteOrbits',
    label: 'SATELLITE ORBITS',
    icon: '🛰️',
    description: 'ORBITAL RINGS WITH SATELLITE TRACKING',
    implemented: true,
  },
  {
    key: 'flightPaths',
    label: 'FLIGHT PATHS',
    icon: '✈️',
    description: 'ANIMATED ARCS BETWEEN AIRPORTS',
    implemented: true,
  },
  {
    key: 'threatHeatmap',
    label: 'THREAT HEATMAP',
    icon: '⚠️',
    description: 'RED/AMBER THREAT INTENSITY OVERLAY',
    implemented: true,
  },
  {
    key: 'investigationSpotlight',
    label: 'INVESTIGATION BEAM',
    icon: '🔦',
    description: 'CONE BEAM ON ACTIVE TARGET',
    implemented: true,
  },
  {
    key: 'cctvMesh',
    label: 'CCTV MESH',
    icon: '📡',
    description: 'SURVEILLANCE CAMERA DENSITY MAP',
    implemented: false,
  },
  {
    key: 'weatherRadar',
    label: 'WEATHER RADAR',
    icon: '🌧️',
    description: 'OPEN-METEO WEATHER OVERLAY',
    implemented: false,
  },
  {
    key: 'earthquakeActivity',
    label: 'EARTHQUAKE ACTIVITY',
    icon: '🌍',
    description: 'USGS SEISMIC EVENT MONITOR',
    implemented: false,
  },
]

export function LayerToggles() {
  const globeLayers = useAppStore((s) => s.globeLayers)
  const toggleGlobeLayer = useAppStore((s) => s.toggleGlobeLayer)

  const activeCount = LAYER_CONFIGS.filter(
    (cfg) => cfg.implemented && globeLayers[cfg.key]
  ).length
  const totalImplemented = LAYER_CONFIGS.filter((cfg) => cfg.implemented).length

  return (
    <div>
      {/* Section header */}
      <div
        className="px-3 py-2 border-t"
        style={{
          borderColor: 'var(--phosphor-faint)',
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
        }}
      >
        DATA LAYERS // {activeCount}/{totalImplemented} ACTIVE
      </div>

      {/* Layer toggle list */}
      <div className="py-1">
        {LAYER_CONFIGS.map((cfg) => (
          <LayerToggleRow
            key={cfg.key}
            config={cfg}
            isActive={globeLayers[cfg.key]}
            onToggle={() => toggleGlobeLayer(cfg.key)}
          />
        ))}
      </div>
    </div>
  )
}

interface LayerToggleRowProps {
  config: LayerConfig
  isActive: boolean
  onToggle: () => void
}

function LayerToggleRow({ config, isActive, onToggle }: LayerToggleRowProps) {
  const canToggle = config.implemented

  return (
    <button
      onClick={canToggle ? onToggle : undefined}
      className="w-full flex items-center gap-2 px-3 py-1"
      style={{
        background: 'transparent',
        border: 'none',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: !canToggle
          ? 'var(--phosphor-faint)'
          : isActive
            ? 'var(--phosphor)'
            : 'var(--phosphor-dim)',
        cursor: canToggle ? 'pointer' : 'not-allowed',
        opacity: canToggle ? 1 : 0.4,
        textTransform: 'uppercase',
        transition: 'all 0.15s ease',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (canToggle) {
          e.currentTarget.style.background = 'var(--bg-overlay)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
      title={config.description}
    >
      {/* Toggle indicator */}
      <span
        style={{
          fontSize: '8px',
          width: '12px',
          textAlign: 'center',
          color: !canToggle
            ? 'var(--phosphor-faint)'
            : isActive
              ? 'var(--phosphor)'
              : 'var(--red-critical)',
          textShadow: isActive && canToggle ? '0 0 6px var(--phosphor-glow)' : 'none',
        }}
      >
        {!canToggle ? '○' : isActive ? '●' : '○'}
      </span>

      {/* Layer icon */}
      <span style={{ width: '14px', textAlign: 'center', fontSize: '11px' }}>
        {config.icon}
      </span>

      {/* Layer name */}
      <span className="flex-1" style={{ letterSpacing: '0.5px' }}>
        {config.label}
      </span>

      {/* Status badge */}
      {!canToggle && (
        <span
          style={{
            fontSize: '8px',
            padding: '1px 4px',
            border: '1px solid var(--phosphor-faint)',
            color: 'var(--phosphor-faint)',
            letterSpacing: '0.5px',
          }}
        >
          PENDING
        </span>
      )}
    </button>
  )
}
