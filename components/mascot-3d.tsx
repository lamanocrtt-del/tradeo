"use client"

import { Suspense, useRef, useEffect, useState, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment, Html, PresentationControls } from "@react-three/drei"
import * as THREE from "three"

// External GLB URL that works correctly
const GLB_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/b2e621b9-ff88-4068-85e2-25534dc820b4-f5TJTtIz0XZrA8T9OxeqSuBSL2DscT.glb"

interface Mascot3DProps {
  size?: number
  pose?: "neutral" | "happy" | "excited" | "sad" | "thinking" | "celebrating"
  autoRotate?: boolean
  className?: string
  slowRotate?: boolean
}

// The 3D Mascot model component - uses external GLB URL
function MascotModel({ pose = "neutral", slowRotate = false }: { pose?: string; slowRotate?: boolean }) {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF(GLB_URL)
  const [hovered, setHovered] = useState(false)

  // Clone the scene to avoid mutations
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Idle animation - subtle floating + slow rotation
  useFrame((state) => {
    if (group.current) {
      // Gentle floating animation
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05
      
      // Slow continuous rotation for idle state
      if (slowRotate) {
        group.current.rotation.y = state.clock.elapsedTime * 0.3
      } else if (pose === "celebrating" || pose === "excited") {
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1
      }
    }
  })

  return (
    <group 
      ref={group} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      <primitive 
        object={clonedScene} 
        scale={1.5}
        position={[0, -1, 0]}
        rotation={[0, Math.PI * 0.1, 0]}
      />
    </group>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    </Html>
  )
}

export function Mascot3D({ size = 200, pose = "neutral", autoRotate = false, slowRotate = false, className }: Mascot3DProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div 
        className={className}
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={className}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Ambient light for general illumination */}
        <ambientLight intensity={0.7} />
        {/* Main directional light */}
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        {/* Fill light from opposite side */}
        <directionalLight position={[-5, 3, -5]} intensity={0.5} />
        {/* Top spotlight */}
        <spotLight position={[0, 10, 0]} intensity={0.6} angle={0.5} />
        
        <Suspense fallback={<LoadingFallback />}>
          <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-0.2, 0.2]}
            azimuth={[-0.5, 0.5]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 300 }}
          >
            <MascotModel pose={pose} slowRotate={slowRotate} />
          </PresentationControls>
          <Environment preset="studio" />
        </Suspense>
        
        {autoRotate && <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />}
      </Canvas>
    </div>
  )
}

// Preload the model
useGLTF.preload(GLB_URL)

export default Mascot3D
