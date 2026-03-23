import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * ThreatHeatmap — PRD Section 6.6 / Phase 1.6
 *
 * Red/amber semi-transparent overlay on the globe surface.
 * Visualizes threat concentrations as glowing hotspot regions.
 *
 * Data source per PRD: AI-generated from target threat scores.
 * Current implementation: Demo hotspots at known threat regions.
 * Will be driven by real target data once Target Manager (Phase 3) is built.
 *
 * Each hotspot is a circular patch on the globe surface rendered as
 * a disc mesh positioned at lat/lon, with color based on threat intensity
 * (amber for medium, red for high/critical) and a subtle pulse animation.
 */

const EARTH_RADIUS = 2
const HEATMAP_ALTITUDE = 0.01 // Just above globe surface

// ═══════════════════════════════════════════════════════════════
//  HOTSPOT DATA
// ═══════════════════════════════════════════════════════════════

interface ThreatHotspot {
  id: string
  name: string
  lat: number
  lon: number
  intensity: number   // 0-1, drives size and opacity
  threatLevel: 'medium' | 'high' | 'critical'
  radius: number      // Visual radius of the hotspot patch
}

/**
 * Demo threat hotspots at regions with elevated threat concentrations.
 * Will be replaced by aggregated target data in Phase 3+5.
 */
const DEMO_HOTSPOTS: ThreatHotspot[] = [
  {
    id: 'ht-eastern-europe',
    name: 'EASTERN EUROPE',
    lat: 50,
    lon: 30,
    intensity: 0.85,
    threatLevel: 'critical',
    radius: 0.35,
  },
  {
    id: 'ht-middle-east',
    name: 'MIDDLE EAST',
    lat: 30,
    lon: 45,
    intensity: 0.7,
    threatLevel: 'high',
    radius: 0.3,
  },
  {
    id: 'ht-east-asia',
    name: 'EAST ASIA',
    lat: 35,
    lon: 115,
    intensity: 0.55,
    threatLevel: 'high',
    radius: 0.25,
  },
  {
    id: 'ht-west-africa',
    name: 'WEST AFRICA',
    lat: 8,
    lon: 2,
    intensity: 0.45,
    threatLevel: 'medium',
    radius: 0.22,
  },
  {
    id: 'ht-central-america',
    name: 'CENTRAL AMERICA',
    lat: 15,
    lon: -88,
    intensity: 0.4,
    threatLevel: 'medium',
    radius: 0.2,
  },
  {
    id: 'ht-south-asia',
    name: 'SOUTH ASIA',
    lat: 25,
    lon: 70,
    intensity: 0.5,
    threatLevel: 'medium',
    radius: 0.25,
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
 * Get hotspot color based on threat level.
 */
function getThreatLevelColor(level: 'medium' | 'high' | 'critical'): THREE.Color {
  switch (level) {
    case 'critical': return new THREE.Color(0xff2020) // --red-critical
    case 'high': return new THREE.Color(0xff4020) // red-orange blend
    case 'medium': return new THREE.Color(0xffb700) // --amber
  }
}

// ═══════════════════════════════════════════════════════════════
//  HOTSPOT PATCH — custom shader for radial gradient
// ═══════════════════════════════════════════════════════════════

/**
 * Vertex shader: passes UV coordinates for radial gradient.
 */
const hotspotVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Fragment shader: radial gradient from center color to transparent edge.
 * Creates a soft, glowing hotspot effect.
 */
const hotspotFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    // Distance from center of the disc (UV center is 0.5, 0.5)
    float dist = distance(vUv, vec2(0.5, 0.5)) * 2.0;

    // Radial falloff — smooth from center to edge
    float alpha = smoothstep(1.0, 0.0, dist);
    alpha = pow(alpha, 1.5); // Tighten the falloff

    // Subtle pulse based on time
    float pulse = 1.0 + 0.15 * sin(uTime * 1.5);

    // Final opacity: intensity * radial falloff * pulse
    float finalAlpha = uIntensity * alpha * pulse * 0.35;

    gl_FragColor = vec4(uColor, finalAlpha);
  }
`

// ═══════════════════════════════════════════════════════════════
//  SINGLE HOTSPOT
// ═══════════════════════════════════════════════════════════════

interface HotspotPatchProps {
  hotspot: ThreatHotspot
}

/**
 * HotspotPatch — a single threat hotspot rendered as a radial-gradient disc
 * on the globe surface.
 */
function HotspotPatch({ hotspot }: HotspotPatchProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const orientedRef = useRef(false)

  const position = useMemo(
    () => latLonToVec3(hotspot.lat, hotspot.lon, EARTH_RADIUS + HEATMAP_ALTITUDE),
    [hotspot.lat, hotspot.lon]
  )

  const color = useMemo(
    () => getThreatLevelColor(hotspot.threatLevel),
    [hotspot.threatLevel]
  )

  const uniforms = useMemo(() => ({
    uColor: { value: color },
    uIntensity: { value: hotspot.intensity },
    uTime: { value: 0 },
  }), [color, hotspot.intensity])

  // Orient to face outward + update time uniform for pulse
  useFrame(({ clock }) => {
    // Orient once after mount
    if (meshRef.current && !orientedRef.current) {
      meshRef.current.lookAt(0, 0, 0)
      meshRef.current.rotateY(Math.PI)
      orientedRef.current = true
    }

    // Update time for pulse animation
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <circleGeometry args={[hotspot.radius, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={hotspotVertexShader}
        fragmentShader={hotspotFragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════
//  THREAT HEATMAP LAYER
// ═══════════════════════════════════════════════════════════════

interface ThreatHeatmapProps {
  visible?: boolean
}

/**
 * ThreatHeatmap — renders all threat hotspot patches on the globe.
 *
 * Placed inside EarthGroup so hotspots rotate with the Earth surface.
 * Uses additive blending for a glowing effect where hotspots overlap.
 * Visibility toggleable via prop (default: true).
 */
export function ThreatHeatmap({ visible = true }: ThreatHeatmapProps) {
  if (!visible) return null

  return (
    <group>
      {DEMO_HOTSPOTS.map((hotspot) => (
        <HotspotPatch key={hotspot.id} hotspot={hotspot} />
      ))}
    </group>
  )
}
