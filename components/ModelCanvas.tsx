"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial, Environment } from "@react-three/drei"
import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

function HackerHead() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      // Idle float animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1

      // Mouse follow with lerp
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mousePosition.x * 0.3, 0.05)
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, mousePosition.y * 0.2, 0.05)

      // Slow rotation
      meshRef.current.rotation.z += 0.005
    }
  })

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} scale={1.2}>
      <MeshDistortMaterial
        color="#149414"
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.4}
        metalness={0.8}
        emissive="#0e6b0e"
        emissiveIntensity={0.2}
      />
    </Sphere>
  )
}

export default function ModelCanvas() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    const handleChange = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  if (reducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <img
          src="/hero-poster.png"
          alt="Agent Tonmoy AI"
          className="w-32 h-32 object-contain opacity-80"
          onError={(e) => {
            // Fallback to placeholder if image doesn't exist
            e.currentTarget.src = "/hacker-ai-head.png"
          }}
        />
      </div>
    )
  }

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#149414" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0e6b0e" />

      <HackerHead />

      <Environment preset="city" />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
