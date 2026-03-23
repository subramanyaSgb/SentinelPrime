import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TargetCoordinates } from '@/types'

/**
 * TargetMarkerLayer — PRD Section 6.6 / Phase 1.3
 *
 * Renders pulsing green circle markers on the globe surface at target coordinates.
 * - Each marker is positioned on the sphere surface via lat/lon → 3D conversion
 * - Pulsing animation: 2s loop, scale oscillation
 * - Markers face outward from sphere center (billboard-like via lookAt)
 * - Click marker → fires onMarkerClick callback
 *
 * Coordinate system:
 * - Earth sphere has radius 2, centered at origin
 * - Markers are placed at radius 2.02 (slightly above surface)
 */

const EARTH_RADIUS = 2
const MARKER_ALTITUDE = 0.02 // Slight offset above surface to prevent z-fighting

/**
 * Target marker data used for rendering.
 * Decoupled from full Target type — only needs what the globe needs.
 */
export interface GlobeMarker {
  id: string
  name: string
  coordinates: TargetCoordinates
  threatScore: number
  hasNewFindings?: boolean
}

interface TargetMarkerLayerProps {
  markers: GlobeMarker[]
  onMarkerClick?: (markerId: string) => void
}

/**
 * Convert lat/lon degrees to 3D position on a sphere.
 * Three.js coordinate system: Y-up, Z-forward.
 *
 * The globe has rotation [0.4, 0, 0] (axial tilt), but markers
 * are placed in the globe's local space, so tilt is inherited.
 */
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180) // polar angle from north pole
  const theta = (lon + 180) * (Math.PI / 180) // azimuthal angle

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

/**
 * Get marker color based on threat score.
 * 0-30: phosphor green (low threat)
 * 31-60: amber (medium threat)
 * 61-100: red-critical (high threat)
 */
function getThreatColor(score: number): THREE.Color {
  if (score > 60) return new THREE.Color(0xff2020) // --red-critical
  if (score > 30) return new THREE.Color(0xffb700) // --amber
  return new THREE.Color(0x00ff41) // --phosphor
}

// ═══════════════════════════════════════════════════════════════
//  SINGLE MARKER
// ═══════════════════════════════════════════════════════════════

interface TargetMarkerProps {
  marker: GlobeMarker
  onClick?: (markerId: string) => void
}

/**
 * TargetMarker — a single pulsing marker on the globe surface.
 *
 * Renders as:
 * 1. Inner solid dot (small circle)
 * 2. Pulsing ring (expanding/fading circle)
 * 3. Glow sprite for visibility at distance
 *
 * The pulse ring uses a 2s animation loop per PRD Section 6.5.
 */
function TargetMarker({ marker, onClick }: TargetMarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const orientedRef = useRef(false)

  const position = useMemo(
    () => latLonToVector3(marker.coordinates.lat, marker.coordinates.lon, EARTH_RADIUS + MARKER_ALTITUDE),
    [marker.coordinates.lat, marker.coordinates.lon]
  )

  const color = useMemo(() => getThreatColor(marker.threatScore), [marker.threatScore])

  // Orient marker to face outward from sphere center + run pulse animation
  useFrame(({ clock }) => {
    // Orient once after mount — lookAt(0,0,0) faces the center,
    // then rotateY(PI) flips it to face outward
    if (groupRef.current && !orientedRef.current) {
      groupRef.current.lookAt(0, 0, 0)
      groupRef.current.rotateY(Math.PI)
      orientedRef.current = true
    }

    // Pulsing animation — 2s loop per PRD Section 6.5
    if (pulseRef.current && glowRef.current) {
      const t = clock.getElapsedTime()
      const pulse = (t % 2) / 2 // 0 → 1 over 2 seconds

      // Pulse ring: expand and fade
      const scale = 1 + pulse * 2.5
      pulseRef.current.scale.set(scale, scale, 1)
      const pulseMaterial = pulseRef.current.material as THREE.MeshBasicMaterial
      pulseMaterial.opacity = 0.6 * (1 - pulse)

      // Glow: subtle brightness oscillation
      const glowPulse = 0.3 + 0.2 * Math.sin(t * Math.PI)
      const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial
      glowMaterial.opacity = glowPulse
    }
  })

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onClick?.(marker.id)
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Inner solid dot — clickable */}
      <mesh onClick={handleClick}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          depthTest={false}
        />
      </mesh>

      {/* Pulsing ring — expands and fades over 2s cycle */}
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.02, 0.03, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glow circle — larger, low-opacity, always visible */}
      <mesh ref={glowRef}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          depthTest={false}
        />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MARKER LAYER
// ═══════════════════════════════════════════════════════════════

/**
 * TargetMarkerLayer — renders all target markers on the globe.
 *
 * This component lives inside the EarthGroup (which handles axial tilt
 * and auto-rotation). Markers inherit the parent group's transform,
 * so they stay perfectly pinned to the globe surface.
 *
 * No rotation is applied here — the parent EarthGroup handles it all.
 */
export function TargetMarkerLayer({ markers, onMarkerClick }: TargetMarkerLayerProps) {
  if (markers.length === 0) return null

  return (
    <group>
      {markers.map((marker) => (
        <TargetMarker
          key={marker.id}
          marker={marker}
          onClick={onMarkerClick}
        />
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
//  DEMO MARKERS — for visual testing before Target Manager exists
// ═══════════════════════════════════════════════════════════════

/**
 * Demo markers for visual testing.
 * These represent sample locations around the globe to verify
 * that lat/lon conversion, positioning, and animation all work.
 * Will be replaced by real target data once Target Manager (Phase 3) is built.
 */
export const DEMO_MARKERS: GlobeMarker[] = [
  {
    id: 'demo-1',
    name: 'NEW YORK',
    coordinates: { lat: 40.7128, lon: -74.006 },
    threatScore: 15,
  },
  {
    id: 'demo-2',
    name: 'LONDON',
    coordinates: { lat: 51.5074, lon: -0.1278 },
    threatScore: 42,
  },
  {
    id: 'demo-3',
    name: 'TOKYO',
    coordinates: { lat: 35.6762, lon: 139.6503 },
    threatScore: 8,
  },
  {
    id: 'demo-4',
    name: 'MOSCOW',
    coordinates: { lat: 55.7558, lon: 37.6173 },
    threatScore: 78,
  },
  {
    id: 'demo-5',
    name: 'SYDNEY',
    coordinates: { lat: -33.8688, lon: 151.2093 },
    threatScore: 22,
  },
  {
    id: 'demo-6',
    name: 'SAO PAULO',
    coordinates: { lat: -23.5505, lon: -46.6333 },
    threatScore: 55,
  },
  {
    id: 'demo-7',
    name: 'BANGALORE',
    coordinates: { lat: 12.9716, lon: 77.5946 },
    threatScore: 10,
  },
]
