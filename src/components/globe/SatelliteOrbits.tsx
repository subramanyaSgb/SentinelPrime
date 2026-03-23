import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * SatelliteOrbits — PRD Section 6.6 / Phase 1.4
 *
 * Thin green orbital rings with slow-moving satellite dots.
 * Represents satellite orbits around the globe.
 *
 * Visual: Thin phosphor green elliptical rings at various inclinations
 * with small bright dots moving along them (satellites).
 *
 * Data source per PRD: Celestrak free TLE data.
 * Current implementation: Pre-computed representative orbits (LEO, MEO, GEO)
 * with realistic inclinations and altitudes. Will be upgraded to live
 * Celestrak TLE parsing with SGP4 propagation when API service layer is built.
 *
 * Globe sphere radius = 2, so orbit altitudes are relative to that:
 * - LEO: ~2.15 (low earth orbit, ~400-2000km)
 * - MEO: ~2.6  (medium earth orbit, ~2000-35000km)
 * - GEO: ~3.2  (geostationary, ~35786km)
 */

const EARTH_RADIUS = 2

/** Orbit definition for rendering */
interface OrbitDef {
  id: string
  name: string
  radius: number       // Distance from center (Earth radius + altitude)
  inclination: number  // Degrees from equatorial plane
  raan: number         // Right ascension of ascending node (rotation around Y)
  speed: number        // Radians per second for satellite dot
  opacity: number      // Ring line opacity
}

/**
 * Pre-computed representative orbits.
 * Mix of LEO (ISS-like), MEO (GPS-like), and GEO (comms) orbits
 * at various inclinations for visual variety.
 */
const ORBITS: OrbitDef[] = [
  // LEO orbits — fast moving, lower altitude
  {
    id: 'leo-1',
    name: 'ISS',
    radius: EARTH_RADIUS + 0.15,
    inclination: 51.6,  // ISS orbital inclination
    raan: 0,
    speed: 0.4,
    opacity: 0.12,
  },
  {
    id: 'leo-2',
    name: 'STARLINK-A',
    radius: EARTH_RADIUS + 0.2,
    inclination: 53,
    raan: 60,
    speed: 0.35,
    opacity: 0.08,
  },
  {
    id: 'leo-3',
    name: 'RECON-SAT',
    radius: EARTH_RADIUS + 0.25,
    inclination: 97.4,  // Sun-synchronous
    raan: 135,
    speed: 0.38,
    opacity: 0.10,
  },
  // MEO orbits — medium speed
  {
    id: 'meo-1',
    name: 'GPS-IIF',
    radius: EARTH_RADIUS + 0.6,
    inclination: 55,
    raan: 30,
    speed: 0.15,
    opacity: 0.06,
  },
  {
    id: 'meo-2',
    name: 'GLONASS',
    radius: EARTH_RADIUS + 0.55,
    inclination: 64.8,
    raan: 180,
    speed: 0.13,
    opacity: 0.06,
  },
  // GEO orbits — slow, high altitude, near-equatorial
  {
    id: 'geo-1',
    name: 'COMMS-GEO',
    radius: EARTH_RADIUS + 1.2,
    inclination: 2,
    raan: 90,
    speed: 0.05,
    opacity: 0.04,
  },
]

// ═══════════════════════════════════════════════════════════════
//  SINGLE ORBIT RING + SATELLITE DOT
// ═══════════════════════════════════════════════════════════════

interface OrbitRingProps {
  orbit: OrbitDef
}

/**
 * OrbitRing — a single orbital ring with a moving satellite dot.
 *
 * The ring is a circle (LineLoop) tilted by the orbit's inclination
 * and rotated by its RAAN. A small sphere moves along the ring path
 * at the orbit's speed.
 */
function OrbitRing({ orbit }: OrbitRingProps) {
  const satRef = useRef<THREE.Mesh>(null)

  // Generate ring points — a circle in the XZ plane
  const ringPoints = useMemo(() => {
    const segments = 128
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push(
        new THREE.Vector3(
          orbit.radius * Math.cos(angle),
          0,
          orbit.radius * Math.sin(angle)
        )
      )
    }
    return points
  }, [orbit.radius])

  // Ring geometry from points
  const ringGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(ringPoints)
    return geo
  }, [ringPoints])

  // Euler rotation: inclination around X, RAAN around Y
  const rotation = useMemo((): [number, number, number] => {
    const incRad = orbit.inclination * (Math.PI / 180)
    const raanRad = orbit.raan * (Math.PI / 180)
    return [incRad, raanRad, 0]
  }, [orbit.inclination, orbit.raan])

  // Animate satellite dot along the orbit path
  useFrame(({ clock }) => {
    if (satRef.current) {
      const t = clock.getElapsedTime()
      const angle = t * orbit.speed
      satRef.current.position.set(
        orbit.radius * Math.cos(angle),
        0,
        orbit.radius * Math.sin(angle)
      )
    }
  })

  return (
    <group rotation={rotation}>
      {/* Orbital ring line */}
      <lineLoop geometry={ringGeometry}>
        <lineBasicMaterial
          color={new THREE.Color(0x00ff41)}
          transparent
          opacity={orbit.opacity}
          depthTest={false}
        />
      </lineLoop>

      {/* Satellite dot — moves along the ring */}
      <mesh ref={satRef}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial
          color={new THREE.Color(0x00ff41)}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
//  SATELLITE ORBITS LAYER
// ═══════════════════════════════════════════════════════════════

interface SatelliteOrbitsProps {
  visible?: boolean
}

/**
 * SatelliteOrbits — renders all orbital rings with satellite dots.
 *
 * This component lives inside the GlobeScene (NOT inside EarthGroup)
 * because orbits don't rotate with the Earth — they maintain their
 * own inertial reference frame.
 *
 * Visibility is toggleable via the `visible` prop (default: true).
 * Layer toggle control will be added in Phase 1.8.
 */
export function SatelliteOrbits({ visible = true }: SatelliteOrbitsProps) {
  if (!visible) return null

  return (
    <group>
      {ORBITS.map((orbit) => (
        <OrbitRing key={orbit.id} orbit={orbit} />
      ))}
    </group>
  )
}
