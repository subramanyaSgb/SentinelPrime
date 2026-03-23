import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * FlightPaths — PRD Section 6.6 / Phase 1.5
 *
 * Animated green dotted arcs on the globe representing flight paths.
 * Visual: Great-circle arcs between city pairs with flowing dot animation.
 *
 * Data source per PRD: OpenSky Network free API.
 * Current implementation: Pre-computed demo routes between major airports.
 * Will be upgraded to live OpenSky data when API service layer is built.
 *
 * Each flight path is a 3D arc (quadratic Bezier curve) between two
 * lat/lon points, lifted above the globe surface. A bright dot flows
 * along each arc to simulate aircraft in flight.
 */

const EARTH_RADIUS = 2

// ═══════════════════════════════════════════════════════════════
//  FLIGHT ROUTE DATA
// ═══════════════════════════════════════════════════════════════

interface FlightRoute {
  id: string
  from: { name: string; lat: number; lon: number }
  to: { name: string; lat: number; lon: number }
  speed: number // 0-1, how fast the dot traverses the arc
}

/**
 * Demo flight routes between major international airports.
 * Mix of short, medium, and long-haul flights for visual variety.
 */
const DEMO_ROUTES: FlightRoute[] = [
  {
    id: 'jfk-lhr',
    from: { name: 'JFK', lat: 40.6413, lon: -73.7781 },
    to: { name: 'LHR', lat: 51.4700, lon: -0.4543 },
    speed: 0.08,
  },
  {
    id: 'lax-nrt',
    from: { name: 'LAX', lat: 33.9425, lon: -118.4081 },
    to: { name: 'NRT', lat: 35.7647, lon: 140.3864 },
    speed: 0.06,
  },
  {
    id: 'dxb-sin',
    from: { name: 'DXB', lat: 25.2532, lon: 55.3657 },
    to: { name: 'SIN', lat: 1.3644, lon: 103.9915 },
    speed: 0.09,
  },
  {
    id: 'cdg-jfk',
    from: { name: 'CDG', lat: 49.0097, lon: 2.5479 },
    to: { name: 'JFK', lat: 40.6413, lon: -73.7781 },
    speed: 0.07,
  },
  {
    id: 'syd-hnd',
    from: { name: 'SYD', lat: -33.9461, lon: 151.1772 },
    to: { name: 'HND', lat: 35.5494, lon: 139.7798 },
    speed: 0.07,
  },
  {
    id: 'gru-lhr',
    from: { name: 'GRU', lat: -23.4356, lon: -46.4731 },
    to: { name: 'LHR', lat: 51.4700, lon: -0.4543 },
    speed: 0.065,
  },
  {
    id: 'blr-dxb',
    from: { name: 'BLR', lat: 13.1986, lon: 77.7066 },
    to: { name: 'DXB', lat: 25.2532, lon: 55.3657 },
    speed: 0.10,
  },
  {
    id: 'svo-pek',
    from: { name: 'SVO', lat: 55.9726, lon: 37.4146 },
    to: { name: 'PEK', lat: 40.0799, lon: 116.6031 },
    speed: 0.075,
  },
]

// ═══════════════════════════════════════════════════════════════
//  GEOMETRY HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Convert lat/lon to 3D position on globe surface.
 */
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

/**
 * Generate a great-circle arc between two lat/lon points.
 * Uses a quadratic Bezier curve with a control point lifted
 * above the midpoint for the arc's altitude.
 *
 * @param from - Start coordinates
 * @param to - End coordinates
 * @param segments - Number of line segments in the arc
 * @param arcHeight - How high above the surface the arc peaks
 * @returns Array of Vector3 points along the arc
 */
function generateArcPoints(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  segments: number,
  arcHeight: number
): THREE.Vector3[] {
  const start = latLonToVec3(from.lat, from.lon, EARTH_RADIUS)
  const end = latLonToVec3(to.lat, to.lon, EARTH_RADIUS)

  // Midpoint between start and end, then push outward for arc height
  const mid = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)
  const midNormal = mid.clone().normalize()
  const controlPoint = midNormal.multiplyScalar(EARTH_RADIUS + arcHeight)

  // Quadratic Bezier: B(t) = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const oneMinusT = 1 - t
    const p = new THREE.Vector3()
    p.addScaledVector(start, oneMinusT * oneMinusT)
    p.addScaledVector(controlPoint, 2 * oneMinusT * t)
    p.addScaledVector(end, t * t)
    points.push(p)
  }
  return points
}

/**
 * Calculate arc height based on distance between two points.
 * Longer routes get higher arcs for better visibility.
 */
function getArcHeight(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number }
): number {
  const start = latLonToVec3(from.lat, from.lon, EARTH_RADIUS)
  const end = latLonToVec3(to.lat, to.lon, EARTH_RADIUS)
  const distance = start.distanceTo(end)
  // Scale arc height with distance: short=0.15, long=0.6
  return Math.max(0.15, Math.min(0.6, distance * 0.15))
}

// ═══════════════════════════════════════════════════════════════
//  AIRPLANE EMOJI TEXTURE — singleton, created once per session
// ═══════════════════════════════════════════════════════════════

let _planeTexture: THREE.CanvasTexture | null = null

/**
 * Returns a shared CanvasTexture with ✈ emoji rendered on it.
 * Cached after first call to avoid recreating per-route.
 */
function getPlaneTexture(): THREE.CanvasTexture {
  if (!_planeTexture) {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 64, 64)
      // Draw a tinted ✈ emoji — visible on dark backgrounds
      ctx.font = '44px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      // Green shadow for phosphor glow effect
      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 8
      ctx.fillStyle = '#00ff41'
      ctx.fillText('✈', 32, 32)
    }
    _planeTexture = new THREE.CanvasTexture(canvas)
  }
  return _planeTexture
}

// ═══════════════════════════════════════════════════════════════
//  SINGLE FLIGHT PATH
// ═══════════════════════════════════════════════════════════════

interface FlightPathProps {
  route: FlightRoute
}

/**
 * FlightPath — a single animated arc between two airports.
 *
 * Renders:
 * 1. A dashed line arc (the path)
 * 2. An airplane ✈ sprite flowing along the arc (billboard — always faces camera)
 */
function FlightPath({ route }: FlightPathProps) {
  const planeRef = useRef<THREE.Sprite>(null)
  const lineRef = useRef<THREE.Line>(null)

  // Shared airplane emoji texture
  const planeTexture = useMemo(() => getPlaneTexture(), [])

  const arcHeight = useMemo(
    () => getArcHeight(route.from, route.to),
    [route.from, route.to]
  )

  const arcPoints = useMemo(
    () => generateArcPoints(route.from, route.to, 64, arcHeight),
    [route.from, route.to, arcHeight]
  )

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(arcPoints)
  }, [arcPoints])

  // Animate the dash offset to create flowing effect + move plane along arc
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Animate dash offset for flowing dashed line
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineDashedMaterial
      material.dashOffset = -t * route.speed * 10
    }

    // Move airplane sprite along the arc
    if (planeRef.current && arcPoints.length > 0) {
      const progress = (t * route.speed) % 1 // 0 → 1, repeating
      const index = Math.floor(progress * (arcPoints.length - 1))
      const nextIndex = Math.min(index + 1, arcPoints.length - 1)
      const frac = (progress * (arcPoints.length - 1)) - index

      // Lerp between two arc points for smooth movement
      const pos = new THREE.Vector3().lerpVectors(
        arcPoints[index],
        arcPoints[nextIndex],
        frac
      )
      planeRef.current.position.copy(pos)
    }
  })

  // Compute line distances for dashed material
  const computedGeometry = useMemo(() => {
    const geo = lineGeometry.clone()
    geo.computeBoundingSphere()
    // Compute cumulative distances for dashed lines
    const positions = geo.getAttribute('position')
    const count = positions.count
    const lineDistances = new Float32Array(count)
    let cumulative = 0
    const prev = new THREE.Vector3()
    const curr = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      curr.fromBufferAttribute(positions, i)
      if (i > 0) {
        cumulative += prev.distanceTo(curr)
      }
      lineDistances[i] = cumulative
      prev.copy(curr)
    }
    geo.setAttribute('lineDistance', new THREE.BufferAttribute(lineDistances, 1))
    return geo
  }, [lineGeometry])

  return (
    <group>
      {/* Dashed arc line */}
      <line ref={lineRef} geometry={computedGeometry}>
        <lineDashedMaterial
          color={new THREE.Color(0x00ff41)}
          transparent
          opacity={0.15}
          dashSize={0.04}
          gapSize={0.04}
          depthTest={false}
        />
      </line>

      {/* ✈ Airplane sprite — billboard facing camera, flows along arc */}
      <sprite ref={planeRef} scale={[0.14, 0.14, 0.14]}>
        <spriteMaterial
          map={planeTexture}
          transparent
          depthTest={false}
          sizeAttenuation
        />
      </sprite>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
//  FLIGHT PATHS LAYER
// ═══════════════════════════════════════════════════════════════

interface FlightPathsProps {
  visible?: boolean
}

/**
 * FlightPaths — renders all flight path arcs on the globe.
 *
 * Placed inside EarthGroup so arcs rotate with the Earth surface.
 * Visibility toggleable via prop (default: true).
 * Layer toggle control will be added in Phase 1.8.
 */
export function FlightPaths({ visible = true }: FlightPathsProps) {
  if (!visible) return null

  return (
    <group>
      {DEMO_ROUTES.map((route) => (
        <FlightPath key={route.id} route={route} />
      ))}
    </group>
  )
}
