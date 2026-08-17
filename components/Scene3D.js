'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const COUNT = 14000
const NEON = new THREE.Color('#00E5FF')

// Shape keyframe scroll stops (must match page.js bands loosely)
const STOPS = [0.0, 0.30, 0.55, 0.78, 1.0]

/* ------------------------- Shape Generators ------------------------- */
function buildShapes() {
  const torus = new Float32Array(COUNT * 3)
  const tunnel = new Float32Array(COUNT * 3)
  const cloud = new Float32Array(COUNT * 3)
  const sun = new Float32Array(COUNT * 3)
  const portal = new Float32Array(COUNT * 3)
  const rand = new Float32Array(COUNT)

  const tilt = 0.62
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const rays = 16

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3
    rand[i] = Math.random()

    // ---- TORUS (hero) centered, tilted ----
    {
      const u = Math.random() * Math.PI * 2
      const v = Math.random() * Math.PI * 2
      const R = 2.6
      const r = 0.95 * (0.82 + Math.random() * 0.18)
      let x = (R + r * Math.cos(v)) * Math.cos(u)
      let y = (R + r * Math.cos(v)) * Math.sin(u)
      let z = r * Math.sin(v)
      // tilt around X
      const y2 = y * cosT - z * sinT
      const z2 = y * sinT + z * cosT
      torus[i3] = x
      torus[i3 + 1] = y2
      torus[i3 + 2] = z2
    }

    // ---- TUNNEL (about) long cylinder along Z, shifted right ----
    {
      const a = Math.random() * Math.PI * 2
      const zpos = -12 + Math.random() * 18 // -12 .. 6 (comes toward camera)
      const flare = 1.7 + (zpos + 12) / 18 * 0.6 + (Math.random() - 0.5) * 0.25
      tunnel[i3] = Math.cos(a) * flare + 2.1 // shift right
      tunnel[i3 + 1] = Math.sin(a) * flare
      tunnel[i3 + 2] = zpos
    }

    // ---- CLOUD (projects) faded wide background ----
    {
      cloud[i3] = (Math.random() - 0.5) * 15
      cloud[i3 + 1] = (Math.random() - 0.5) * 9
      cloud[i3 + 2] = -3 - Math.random() * 7
    }

    // ---- SUNBURST (philosophy) radial neural flower, centered ----
    {
      let ang, radius
      if (Math.random() < 0.62) {
        const ray = Math.floor(Math.random() * rays)
        ang = (ray / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.07
        radius = Math.pow(Math.random(), 0.7) * 3.3
      } else {
        ang = Math.random() * Math.PI * 2
        const ringIdx = Math.floor(Math.random() * 6)
        radius = 0.4 + ringIdx * 0.5 + (Math.random() - 0.5) * 0.1
      }
      const sx = Math.cos(ang) * radius
      const sy = Math.sin(ang) * radius
      const sz = (Math.random() - 0.5) * 0.45
      sun[i3] = sx
      sun[i3 + 1] = sy
      sun[i3 + 2] = sz

      // ---- PORTAL (footer) same flower pushed to right edge ----
      portal[i3] = sx * 1.2 + 3.7
      portal[i3 + 1] = sy * 1.2
      portal[i3 + 2] = sz
    }
  }

  return { torus, tunnel, cloud, sun, portal, rand }
}

/* ------------------------------ Shaders ------------------------------ */
const vertex = `
  uniform float uSeg;
  uniform float uT;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixel;
  attribute vec3 aTunnel;
  attribute vec3 aCloud;
  attribute vec3 aSun;
  attribute vec3 aPortal;
  attribute float aRandom;
  varying float vR;
  void main() {
    vec3 pA; vec3 pB;
    if (uSeg < 0.5) { pA = position; pB = aTunnel; }
    else if (uSeg < 1.5) { pA = aTunnel; pB = aCloud; }
    else if (uSeg < 2.5) { pA = aCloud; pB = aSun; }
    else { pA = aSun; pB = aPortal; }
    vec3 pos = mix(pA, pB, uT);
    float w = uTime * 0.6 + aRandom * 6.2831;
    pos += vec3(sin(w), cos(w * 1.1), sin(w * 0.7)) * 0.045;
    vR = aRandom;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixel * (1.0 / -mv.z);
  }
`

const fragment = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vR;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);
    vec3 col = mix(uColor, vec3(1.0), core * 0.75);
    float a = glow * glow * uOpacity * (0.55 + 0.45 * vR);
    gl_FragColor = vec4(col, a);
  }
`

function smoothstep(t) {
  t = Math.min(1, Math.max(0, t))
  return t * t * (3 - 2 * t)
}

/* ---------------------------- Particles ---------------------------- */
function Particles({ progressRef }) {
  const pointsRef = useRef()
  const shapes = useMemo(() => buildShapes(), [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(shapes.torus, 3))
    g.setAttribute('aTunnel', new THREE.BufferAttribute(shapes.tunnel, 3))
    g.setAttribute('aCloud', new THREE.BufferAttribute(shapes.cloud, 3))
    g.setAttribute('aSun', new THREE.BufferAttribute(shapes.sun, 3))
    g.setAttribute('aPortal', new THREE.BufferAttribute(shapes.portal, 3))
    g.setAttribute('aRandom', new THREE.BufferAttribute(shapes.rand, 1))
    return g
  }, [shapes])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uSeg: { value: 0 },
        uT: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 26 },
        uPixel: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
        uColor: { value: NEON.clone() },
        uOpacity: { value: 1 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  useFrame((state, delta) => {
    const p = progressRef.current || 0
    // find segment
    let seg = 0
    for (let i = 0; i < STOPS.length - 1; i++) {
      if (p >= STOPS[i] && p <= STOPS[i + 1]) {
        seg = i
        break
      }
      if (p > STOPS[STOPS.length - 1]) seg = STOPS.length - 2
    }
    const t = (p - STOPS[seg]) / (STOPS[seg + 1] - STOPS[seg])
    const m = material
    m.uniforms.uSeg.value = seg
    m.uniforms.uT.value = smoothstep(t)
    m.uniforms.uTime.value += delta
    // dim during projects (cloud) phase, peak at p=0.55
    const g = Math.exp(-Math.pow((p - 0.55) / 0.11, 2))
    m.uniforms.uOpacity.value = 1 - 0.72 * g
    if (pointsRef.current) {
      pointsRef.current.rotation.z += delta * 0.045
      pointsRef.current.rotation.y = Math.sin(m.uniforms.uTime.value * 0.12) * 0.25
    }
    // subtle camera parallax
    const cam = state.camera
    cam.position.x += (state.pointer.x * 0.6 - cam.position.x) * 0.04
    cam.position.y += (state.pointer.y * 0.4 - cam.position.y) * 0.04
    cam.lookAt(0, 0, 0)
  })

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  )
}

/* ------------------------------ Scene ------------------------------ */
export default function Scene3D({ progressRef }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
    >
      <Particles progressRef={progressRef} />
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.0}
          luminanceSmoothing={0.9}
          radius={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  )
}
