import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * InvestigationSpotlight — PRD Section 6.6 / Phase 1.7
 *
 * Green cone beam from above projected down to the active target location.
 * Visualizes which target is currently under investigation.
 *
 * Data source per PRD: Active target coordinates.
 * The cone originates from a point above the globe surface and
 * narrows to the target location, creating a "spotlight from space" effect.
 *
 * When no target is active, the spotlight is hidden.
 * Demo mode shows a spotlight on Moscow (critical-threat demo target).
 */

const EARTH_RADIUS = 2

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

// ═══════════════════════════════════════════════════════════════
//  CONE BEAM SHADER
// ═══════════════════════════════════════════════════════════════

/**
 * Vertex shader: passes position along the cone for gradient.
 */
const coneVertexShader = `
  varying float vHeight;
  varying vec2 vUv;
  void main() {
    vHeight = position.y;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Fragment shader: green cone with vertical gradient (bright at tip, fading up).
 * Edges are softer than the center for a volumetric feel.
 */
const coneFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  varying float vHeight;
  varying vec2 vUv;

  void main() {
    // PHANTOM GRID phosphor green
    vec3 color = vec3(0.0, 1.0, 0.255);

    // Vertical gradient: brighter at the bottom (target), fading up
    float heightFade = 1.0 - smoothstep(0.0, 1.0, vHeight);

    // Radial fade from center to edge (softer edges)
    float distFromCenter = distance(vUv, vec2(0.5, vUv.y)) * 2.0;
    float radialFade = 1.0 - smoothstep(0.3, 1.0, distFromCenter);

    // Subtle scan line effect moving down the cone
    float scanLine = 0.8 + 0.2 * sin((vHeight * 20.0) - uTime * 3.0);

    // Combine
    float alpha = heightFade * radialFade * scanLine * uIntensity * 0.25;

    gl_FragColor = vec4(color, alpha);
  }
`

// ═══════════════════════════════════════════════════════════════
//  GROUND RING (impact point)
// ═══════════════════════════════════════════════════════════════

/**
 * SpotlightRing — pulsing ring at the base of the spotlight cone
 * where it meets the globe surface.
 */
interface SpotlightRingProps {
  position: THREE.Vector3
}

function SpotlightRing({ position }: SpotlightRingProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const orientedRef = useRef(false)

  useFrame(({ clock }) => {
    if (ringRef.current && !orientedRef.current) {
      ringRef.current.lookAt(0, 0, 0)
      ringRef.current.rotateY(Math.PI)
      orientedRef.current = true
    }

    if (ringRef.current) {
      const t = clock.getElapsedTime()
      // Pulsing scale
      const pulse = 1 + 0.15 * Math.sin(t * 2)
      ringRef.current.scale.set(pulse, pulse, 1)
    }
  })

  return (
    <mesh ref={ringRef} position={position}>
      <ringGeometry args={[0.08, 0.12, 32]} />
      <meshBasicMaterial
        color={new THREE.Color(0x00ff41)}
        transparent
        opacity={0.4}
        depthTest={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════
//  SPOTLIGHT COMPONENT
// ═══════════════════════════════════════════════════════════════

interface InvestigationSpotlightProps {
  /** Target coordinates. If null, spotlight is hidden. */
  targetLat?: number
  targetLon?: number
  visible?: boolean
}

/**
 * InvestigationSpotlight — green cone beam from above to active target.
 *
 * Renders a 3D cone from a high point above the target down to the
 * globe surface, plus a pulsing ring at the impact point.
 *
 * The cone is positioned in the EarthGroup's local space, so it
 * rotates with the Earth.
 *
 * Default demo: spotlight on Moscow (55.76°N, 37.62°E) — the
 * critical-threat demo marker from Phase 1.3.
 */
export function InvestigationSpotlight({
  targetLat = 55.7558,
  targetLon = 37.6173,
  visible = true,
}: InvestigationSpotlightProps) {
  const coneRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Target position on globe surface
  const targetPos = useMemo(
    () => latLonToVec3(targetLat, targetLon, EARTH_RADIUS + 0.02),
    [targetLat, targetLon]
  )

  // Cone apex: a point high above the target, along the surface normal
  const coneHeight = 1.5
  const apexPos = useMemo(() => {
    const normal = targetPos.clone().normalize()
    return targetPos.clone().add(normal.multiplyScalar(coneHeight))
  }, [targetPos, coneHeight])

  // Midpoint for cone placement
  const coneMidpoint = useMemo(() => {
    return new THREE.Vector3().addVectors(targetPos, apexPos).multiplyScalar(0.5)
  }, [targetPos, apexPos])

  // Direction from apex to target (the cone points downward)
  const coneDirection = useMemo(() => {
    return new THREE.Vector3().subVectors(targetPos, apexPos).normalize()
  }, [targetPos, apexPos])

  // Quaternion to orient the cone along the direction
  const coneQuaternion = useMemo(() => {
    // ConeGeometry points along +Y by default, we need to rotate it
    const defaultDir = new THREE.Vector3(0, -1, 0)
    return new THREE.Quaternion().setFromUnitVectors(defaultDir, coneDirection)
  }, [coneDirection])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
  }), [])

  // Update time uniform
  useFrame(({ clock }) => {
    if (materialRef.current?.uniforms?.uTime) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  if (!visible) return null

  return (
    <group>
      {/* Cone beam */}
      <mesh
        ref={coneRef}
        position={coneMidpoint}
        quaternion={coneQuaternion}
      >
        <coneGeometry args={[0.3, coneHeight, 32, 1, true]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={coneVertexShader}
          fragmentShader={coneFragmentShader}
          uniforms={uniforms}
          transparent
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Impact ring at target location */}
      <SpotlightRing position={targetPos} />
    </group>
  )
}
