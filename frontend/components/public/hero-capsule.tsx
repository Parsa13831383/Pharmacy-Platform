'use client'

import { useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ─── Tuning knobs (edit these to taste) ──────────────────────────────────────
const CFG = {
  // Capsule geometry
  RADIUS:        0.32,   // hemisphere radius
  HALF_LEN:      0.28,   // half of the cylindrical shaft length
  PARTICLE_COUNT: 18,    // inner glowing spheres

  // Float / rotation
  FLOAT_SPEED:   0.52,   // radians/s — lower = slower bob
  FLOAT_AMP:     0.14,   // world units — amplitude of the float arc
  SPIN_SPEED:    0.32,   // radians/s — slow 360° rotation

  // Mouse parallax (0 = no response, 1 = full tilt)
  MOUSE_TILT_X:  0.38,   // max rotation.x from mouse Y-axis
  MOUSE_TILT_Z:  0.14,   // max rotation.z from mouse X-axis
  MOUSE_DAMP:    0.045,  // exponential decay factor (lower = silkier)

  // Particle motion
  PARTICLE_SAFE: 0.76,   // fraction of capsule interior to fill (0–1)
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ParticleData = {
  origin: [number, number, number]
  color:  string
  size:   number
  speed:  number
  phase:  number
}

// ─── Tiny glowing sphere representing an active ingredient ────────────────────
function Particle({ origin, color, size, speed, phase }: ParticleData) {
  const meshRef = useRef<THREE.Mesh>(null)
  const base    = useMemo(() => new THREE.Vector3(...origin), [origin])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime() * speed + phase
    // Lissajous-like organic drift — each axis has a different frequency
    meshRef.current.position.x = base.x + Math.sin(t * 1.1)  * 0.055
    meshRef.current.position.y = base.y + Math.sin(t * 0.9)  * 0.075
    meshRef.current.position.z = base.z + Math.cos(t * 0.7)  * 0.04
  })

  return (
    <mesh ref={meshRef} position={origin}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={4}   // HDR intensity — creates natural glow via tonemapping
        toneMapped={false}
      />
    </mesh>
  )
}

// ─── Glass capsule + inner particles ─────────────────────────────────────────
function GlassCapsule({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
}) {
  const outerRef = useRef<THREE.Group>(null)   // receives mouse tilt
  const innerRef = useRef<THREE.Group>(null)   // bob float + y-spin

  const { RADIUS, HALF_LEN, PARTICLE_SAFE, PARTICLE_COUNT } = CFG

  // ── Particle placement — rejection sampling inside capsule volume ──────────
  const particles = useMemo<ParticleData[]>(() => {
    const PALETTE = ['#4ade80', '#34d399', '#6ee7b7', '#a7f3d0', '#86efac']
    const result: ParticleData[] = []
    let attempts = 0

    while (result.length < PARTICLE_COUNT && attempts < 2000) {
      attempts++
      // Uniform disk sampling (sqrt prevents clustering at center)
      const r = RADIUS * PARTICLE_SAFE * Math.sqrt(Math.random())
      const θ = Math.random() * Math.PI * 2
      const x = r * Math.cos(θ)
      const z = r * Math.sin(θ)
      const y = (Math.random() * 2 - 1) * (HALF_LEN + RADIUS) * PARTICLE_SAFE

      // Accept only points geometrically inside the capsule
      const inBody = Math.abs(y) <= HALF_LEN && x * x + z * z <= (RADIUS * PARTICLE_SAFE) ** 2
      const dTop   = Math.sqrt(x * x + (y - HALF_LEN) ** 2 + z * z)
      const dBot   = Math.sqrt(x * x + (y + HALF_LEN) ** 2 + z * z)
      const inCap  = dTop <= RADIUS * PARTICLE_SAFE || dBot <= RADIUS * PARTICLE_SAFE

      if (inBody || inCap) {
        result.push({
          origin: [x, y, z],
          color:  PALETTE[Math.floor(Math.random() * PALETTE.length)],
          size:   0.018 + Math.random() * 0.018,
          speed:  0.45  + Math.random() * 0.55,
          phase:  Math.random() * Math.PI * 2,
        })
      }
    }
    return result
  }, [RADIUS, HALF_LEN, PARTICLE_SAFE, PARTICLE_COUNT])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Outer group — smooth mouse parallax tilt (exponential decay)
    if (outerRef.current) {
      outerRef.current.rotation.x +=
        (mouseRef.current.y * CFG.MOUSE_TILT_X - outerRef.current.rotation.x) * CFG.MOUSE_DAMP
      outerRef.current.rotation.z +=
        (-mouseRef.current.x * CFG.MOUSE_TILT_Z - outerRef.current.rotation.z) * CFG.MOUSE_DAMP
    }

    // Inner group — gravity-defying float + continuous spin
    if (innerRef.current) {
      innerRef.current.position.y = Math.sin(t * CFG.FLOAT_SPEED) * CFG.FLOAT_AMP
      innerRef.current.rotation.y = t * CFG.SPIN_SPEED
    }
  })

  return (
    <group ref={outerRef}>
      <group ref={innerRef}>

        {/*
         * Glass shell — MeshTransmissionMaterial from @react-three/drei gives
         * physically-based glass: refraction, chromatic aberration, thickness attenuation.
         *
         * Quality vs performance:
         *   samples     — increase to 8–16 for sharper glass (costs GPU time)
         *   resolution  — increase to 512 for crisper refraction background
         */}
        <mesh>
          <capsuleGeometry args={[RADIUS, HALF_LEN * 2, 20, 40]} />
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.22}
            samples={4}
            resolution={256}
            transmission={0.97}
            roughness={0.04}
            thickness={0.45}
            ior={1.52}
            chromaticAberration={0.045}
            anisotropy={0.12}
            distortion={0.07}
            distortionScale={0.12}
            temporalDistortion={0.12}
            color="#d1fae5"
            attenuationColor="#6ee7b7"
            attenuationDistance={1.2}
          />
        </mesh>

        {/* Active ingredient spheres — float organically inside the shell */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

      </group>
    </group>
  )
}

// ─── Lighting & scene graph ───────────────────────────────────────────────────
function Scene() {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Normalize mouse to [-1, 1] in both axes
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      {/* Ambient — soft fill so backside isn't pitch black */}
      <ambientLight intensity={0.65} />

      {/* Key light — warm white from upper-right for main specular highlight */}
      <directionalLight position={[4, 7, 4]} intensity={1.5} color="#fff8f0" />

      {/* Pharmacy green rim — makes particles glow green through the glass */}
      <pointLight position={[-3, 2, 3]} intensity={1.4} color="#34d399" />

      {/* Cool blue fill — premium glass refraction blueshift */}
      <pointLight position={[4, -3, 2]} intensity={0.7} color="#93c5fd" />

      {/* Top spot — soft overhead catch-light on the glass dome */}
      <spotLight position={[0, 4, 3]} angle={0.45} penumbra={0.9} intensity={0.9} />

      {/* HDRI environment — critical for physically-correct glass reflections */}
      <Environment preset="city" />

      <GlassCapsule mouseRef={mouseRef} />
    </>
  )
}

// ─── Canvas root — default export, consumed via next/dynamic with ssr:false ───
export default function HeroCapsule3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        // ACES filmic tonemapping — makes the high-emissive particles
        // bloom naturally without explicit post-processing
        gl.toneMapping         = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.2
      }}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',   // canvas never blocks clicks on underlying elements
      }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
