'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Environment, Float, Html, useGLTF } from '@react-three/drei'
import type { LucideIcon } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Group, Object3D } from 'three'

type CommodityModelProps = {
  src: string
  icon: LucideIcon
  reducedMotion: boolean
}

function ModelFallback({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Html center>
      <div className="grid h-28 w-28 place-items-center rounded-full border border-white/30 bg-white/10 text-white shadow-2xl backdrop-blur-md">
        <Icon size={62} strokeWidth={1.4} />
      </div>
    </Html>
  )
}

class ModelErrorBoundary extends React.Component<{ icon: LucideIcon; children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? <ModelFallback icon={this.props.icon} /> : this.props.children
  }
}

function ModelAsset({ src, reducedMotion }: Omit<CommodityModelProps, 'icon'>) {
  const { scene } = useGLTF(src)
  const group = useRef<Group>(null)
  const model = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry = mesh.geometry.clone()
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(material => material.clone())
        : mesh.material.clone()
    })
    return cloned
  }, [scene])
  const normalized = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxSize = Math.max(size.x, size.y, size.z) || 1
    const scale = 2.65 / maxSize
    return { center, scale }
  }, [model])

  useEffect(() => {
    model.traverse((object: Object3D) => {
      object.frustumCulled = false
    })
    return () => {
      model.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.geometry.dispose()
        if (Array.isArray(mesh.material)) mesh.material.forEach(material => material.dispose())
        else mesh.material.dispose()
      })
    }
  }, [model])

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.set(0.05, -0.2, -0.25)
    if (!reducedMotion) group.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.25) * 0.08
  })

  return (
    <Float enabled={!reducedMotion} speed={1.25} rotationIntensity={0.1} floatIntensity={0.18}>
      <Center>
        <group ref={group} scale={normalized.scale} position={[-normalized.center.x * normalized.scale, -normalized.center.y * normalized.scale, -normalized.center.z * normalized.scale]}>
          <primitive object={model} />
        </group>
      </Center>
    </Float>
  )
}

function Scene({ src, icon, reducedMotion }: CommodityModelProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={2.2} />
      <directionalLight position={[3, 4, 5]} intensity={3.4} color="#fff4dd" />
      <directionalLight position={[-4, 1, 2]} intensity={1.8} color="#d8f7e4" />
      <Environment preset="city" background={false} />
      <ModelErrorBoundary icon={icon}>
        <React.Suspense fallback={<Html center><div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-label="Memuat model" /></Html>}>
          <ModelAsset src={src} reducedMotion={reducedMotion} />
        </React.Suspense>
      </ModelErrorBoundary>
    </Canvas>
  )
}

export default function CommodityModel3D(props: CommodityModelProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="grid h-full min-h-[390px] place-items-center" aria-label="Memuat model" />
  return <Scene {...props} />
}
