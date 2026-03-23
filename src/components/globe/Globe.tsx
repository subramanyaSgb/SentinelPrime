import { useRef, useState, useCallback, useEffect, Component } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/appStore'
import type { GlobeLayerVisibility } from '@/store/appStore'
import { RadarSweep } from './RadarSweep'
import { TargetMarkerLayer, DEMO_MARKERS } from './TargetMarkerLayer'
import type { GlobeMarker } from './TargetMarkerLayer'
import { SatelliteOrbits } from './SatelliteOrbits'
import { FlightPaths } from './FlightPaths'
import { ThreatHeatmap } from './ThreatHeatmap'
import { InvestigationSpotlight } from './InvestigationSpotlight'

/**
 * Mission Control Globe — PRD Section 6.6
 *
 * Three.js globe with NASA Black Marble (night lights) texture.
 * - Auto-rotates at 0.1 deg/s, pauses on hover/drag
 * - Green-tinted atmosphere glow halo (additive blending)
 * - Orbit controls: drag to rotate, scroll to zoom
 * - Phosphor green color scheme matching PHANTOM GRID
 *
 * Texture loading strategy:
 * 1. Try NASA Black Marble from remote URL
 * 2. Try local fallback texture (/textures/earth-fallback.jpg)
 * 3. Fall back to procedural green wireframe
 *
 * The radar sweep ALWAYS renders — it is independent of Canvas/texture state.
 */

// Texture URLs in priority order
const EARTH_TEXTURE_URLS = [
  'https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg',
  '/textures/earth-fallback.jpg',
]

const ROTATION_SPEED = 0.1 * (Math.PI / 180) // 0.1 deg/s in radians

// ═══════════════════════════════════════════════════════════════
//  ERROR BOUNDARY — catches Canvas/Three.js crashes
// ═══════════════════════════════════════════════════════════════

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * CanvasErrorBoundary — wraps the Three.js Canvas.
 * If the Canvas crashes (texture errors, WebGL failures, etc.),
 * this catches the error and renders a visible PHANTOM GRID fallback
 * WITHOUT taking down the radar sweep or the rest of the page.
 */
class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// ═══════════════════════════════════════════════════════════════
//  TEXTURE LOADING — manual loader with fallback chain
// ═══════════════════════════════════════════════════════════════

type TextureStatus = 'loading' | 'loaded' | 'failed'

/**
 * useEarthTexture — loads the NASA Black Marble texture with a fallback chain.
 * Returns { texture, status } where texture is null if loading or all sources failed.
 *
 * Uses imperative THREE.TextureLoader instead of useLoader to avoid
 * Suspense-based crashes when the texture URL is unreachable.
 */
function useEarthTexture(): { texture: THREE.Texture | null; status: TextureStatus } {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [status, setStatus] = useState<TextureStatus>('loading')
  const attemptedRef = useRef(false)

  useEffect(() => {
    if (attemptedRef.current) return
    attemptedRef.current = true

    const loader = new THREE.TextureLoader()
    let cancelled = false

    function tryLoad(urlIndex: number) {
      if (cancelled) return
      if (urlIndex >= EARTH_TEXTURE_URLS.length) {
        // All sources exhausted — fall back to wireframe
        setStatus('failed')
        return
      }

      const url = EARTH_TEXTURE_URLS[urlIndex] ?? ''
      loader.load(
        url,
        // onLoad — success
        (loadedTexture) => {
          if (cancelled) {
            loadedTexture.dispose()
            return
          }
          loadedTexture.colorSpace = THREE.SRGBColorSpace
          setTexture(loadedTexture)
          setStatus('loaded')
        },
        // onProgress — ignored
        undefined,
        // onError — try next URL in chain
        () => {
          if (!cancelled) {
            tryLoad(urlIndex + 1)
          }
        }
      )
    }

    tryLoad(0)

    return () => {
      cancelled = true
    }
  }, [])

  return { texture, status }
}

// ═══════════════════════════════════════════════════════════════
//  EARTH COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface EarthGroupProps {
  isInteracting: boolean
  markers: GlobeMarker[]
  onMarkerClick?: (markerId: string) => void
  layers: GlobeLayerVisibility
}

/**
 * EarthGroup — parent group containing the Earth mesh + target markers.
 *
 * Both share the same rotation group so markers stay pinned to the
 * globe surface during auto-rotation and user interaction.
 * - Axial tilt: 0.4 radians (~23 degrees) applied to the group
 * - Auto-rotation: Y-axis rotation applied to the group
 */
function EarthGroup({ isInteracting, markers, onMarkerClick, layers }: EarthGroupProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { texture, status } = useEarthTexture()

  // Auto-rotation — pauses when user is interacting
  useFrame((_state, delta) => {
    if (groupRef.current && !isInteracting) {
      groupRef.current.rotation.y += ROTATION_SPEED * delta * 60
    }
  })

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      {/* Earth sphere */}
      {status === 'loaded' && texture ? (
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            emissive={new THREE.Color(0x003311)}
            emissiveIntensity={0.15}
          />
        </mesh>
      ) : (
        /* Wireframe fallback — phosphor green so it's visible against --bg-void */
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial
            color={new THREE.Color(0x00ff41)}
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* Target markers — inside the same group, rotate with Earth */}
      {layers.targetMarkers && (
        <TargetMarkerLayer markers={markers} onMarkerClick={onMarkerClick} />
      )}

      {/* Flight path arcs — rotate with Earth (connect surface locations) */}
      {layers.flightPaths && <FlightPaths />}

      {/* Threat heatmap — red/amber hotspot patches on surface */}
      {layers.threatHeatmap && <ThreatHeatmap />}

      {/* Investigation spotlight — green cone beam on active target */}
      {/* Demo: Moscow (critical-threat marker) — will wire to activeTargetId in Phase 3 */}
      {layers.investigationSpotlight && <InvestigationSpotlight />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
//  ATMOSPHERE + STARS
// ═══════════════════════════════════════════════════════════════

/**
 * Atmosphere Glow — thin green-tinted halo around the globe.
 * Uses a slightly larger sphere with additive blending and custom shader.
 */
function AtmosphereGlow() {
  return (
    <mesh scale={[1.04, 1.04, 1.04]}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// Atmosphere shader — glows green at the edges (Fresnel effect)
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, 3.0);
    // PHANTOM GRID phosphor green glow
    vec3 glowColor = vec3(0.0, 1.0, 0.255);
    gl_FragColor = vec4(glowColor * fresnel * 0.6, fresnel * 0.4);
  }
`

/**
 * Ambient star field — distant points in the background.
 */
function StarField() {
  const starsRef = useRef<THREE.Points>(null)

  const starPositions = useCallback(() => {
    const positions = new Float32Array(3000 * 3)
    for (let i = 0; i < 3000; i++) {
      const r = 50 + Math.random() * 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    return positions
  }, [])

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={3000}
          array={starPositions()}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={new THREE.Color(0x00ff41)}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════
//  GLOBE SCENE + MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

/**
 * GlobeScene — the complete Three.js scene inside Canvas.
 */
function GlobeScene() {
  const [isInteracting, setIsInteracting] = useState(false)
  const globeLayers = useAppStore((s) => s.globeLayers)

  // TODO: Replace DEMO_MARKERS with real targets from useTargetStore
  // once Target Manager (Phase 3) is built
  const markers: GlobeMarker[] = DEMO_MARKERS

  const handleMarkerClick = useCallback((_markerId: string) => {
    // TODO: Wire to appStore.setActiveTargetId + open right panel
    // once Target Manager (Phase 3) is built.
    // For now, click events are captured but no action is taken.
  }, [])

  return (
    <>
      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.15} color={new THREE.Color(0x00ff41)} />

      {/* Directional light for subtle highlights */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={0.8}
        color={new THREE.Color(0xffffff)}
      />

      {/* Point light for phosphor glow on the lit side */}
      <pointLight
        position={[-5, 2, 4]}
        intensity={0.3}
        color={new THREE.Color(0x00ff41)}
        distance={20}
      />

      {/* Star field background */}
      <StarField />

      {/* Earth + surface layers — shared rotation group */}
      <EarthGroup
        isInteracting={isInteracting}
        markers={markers}
        onMarkerClick={handleMarkerClick}
        layers={globeLayers}
      />

      {/* Satellite orbit rings — inertial frame, don't rotate with Earth */}
      {globeLayers.satelliteOrbits && <SatelliteOrbits />}

      {/* Atmosphere glow */}
      <AtmosphereGlow />

      {/* Orbit controls */}
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={3}
        maxDistance={10}
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
      />
    </>
  )
}

/**
 * CanvasErrorFallback — shown when WebGL / Three.js Canvas crashes.
 * Still renders the radar sweep underneath + a PHANTOM GRID error message.
 */
function CanvasErrorFallback() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
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
            fontSize: '11px',
            color: 'var(--amber)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          ⚠ WEBGL // RENDER_ERROR
        </div>
        <div
          style={{
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            textTransform: 'uppercase',
            lineHeight: '1.6',
          }}
        >
          3D GLOBE FAILED TO INITIALIZE.
          <br />
          RADAR SWEEP OPERATING NORMALLY.
          <br />
          <span style={{ opacity: 0.5 }}>
            CHECK BROWSER WEBGL SUPPORT // GPU DRIVERS
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Globe — the main exported component.
 *
 * Architecture:
 * - RadarSweep renders at z-index 0 — ALWAYS visible, independent of Canvas
 * - Canvas wrapped in CanvasErrorBoundary — crashes don't propagate
 * - GlobeHUD renders at z-index 2 — overlay labels
 *
 * If Canvas crashes, RadarSweep + error message still render.
 * If texture fails, wireframe globe + radar sweep still render.
 */
export function Globe() {
  return (
    <div
      className="flex-1 relative"
      style={{ background: 'var(--bg-void)', minHeight: '400px' }}
    >
      {/* Radar sweep — ALWAYS renders, independent of Canvas state (z-index: 0) */}
      <RadarSweep />

      {/* Three.js canvas — wrapped in error boundary (z-index: 1) */}
      <CanvasErrorBoundary fallback={<CanvasErrorFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0x020802), 0)
            gl.toneMapping = THREE.NoToneMapping
          }}
        >
          <GlobeScene />
        </Canvas>
      </CanvasErrorBoundary>

      {/* Globe HUD overlay — above everything (z-index: 2) */}
      <GlobeHUD />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  GLOBE HUD
// ═══════════════════════════════════════════════════════════════

/**
 * GlobeHUD — overlaid UI elements on top of the 3D canvas.
 * Shows globe status info in PHANTOM GRID style.
 */
function GlobeHUD() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
      {/* Top-left: Globe label */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '16px',
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      >
        <span style={{ color: 'var(--phosphor)' }} className="text-glow">
          📡
        </span>{' '}
        MISSION CONTROL // GLOBAL OVERVIEW
      </div>

      {/* Bottom-left: texture source */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '16px',
          fontSize: '9px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          opacity: 0.3,
        }}
      >
        TEXTURE: NASA BLACK MARBLE // PUBLIC DOMAIN
      </div>

      {/* Bottom-right: controls hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          fontSize: '9px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          opacity: 0.3,
        }}
      >
        DRAG: ROTATE // SCROLL: ZOOM
      </div>
    </div>
  )
}
