'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
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
  const heroAlt = new Float32Array(COUNT * 3)
  const vortex = new Float32Array(COUNT * 3)
  const rand = new Float32Array(COUNT)

  // ---- HERO ALT: hypercube / tesseract edge cloud (time-morph target) ----
  const cubeVerts = (s) => {
    const v = []
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x * s, y * s, z * s])
    return v
  }
  const rot = (v, a) => {
    // rotate around Y then X by angle a (for the tesseract inner-cube offset)
    const c = Math.cos(a), s = Math.sin(a)
    let [x, y, z] = v
    let x1 = x * c + z * s, z1 = -x * s + z * c
    let y2 = y * c - z1 * s, z2 = y * s + z1 * c
    return [x1, y2, z2]
  }
  const outer = cubeVerts(2.2)
  const inner = cubeVerts(1.25).map((v) => rot(v, 0.7))
  const edgesOf = (verts) => {
    const e = []
    for (let a = 0; a < 8; a++)
      for (let b = a + 1; b < 8; b++) {
        let diff = 0
        for (let k = 0; k < 3; k++) if (Math.sign(verts[a][k]) !== Math.sign(verts[b][k])) diff++
        if (diff === 1) e.push([verts[a], verts[b]])
      }
    return e
  }
  const hcEdges = [...edgesOf(outer), ...edgesOf(inner)]
  for (let k = 0; k < 8; k++) hcEdges.push([outer[k], inner[k]]) // connectors

  const tilt = 0.62
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const rays = 16

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3
    rand[i] = Math.random()

    // ---- HERO ALT (hypercube edge sampling) ----
    {
      const e = hcEdges[Math.floor(Math.random() * hcEdges.length)]
      const tt = Math.random()
      heroAlt[i3] = e[0][0] + (e[1][0] - e[0][0]) * tt + (Math.random() - 0.5) * 0.06
      heroAlt[i3 + 1] = e[0][1] + (e[1][1] - e[0][1]) * tt + (Math.random() - 0.5) * 0.06
      heroAlt[i3 + 2] = e[0][2] + (e[1][2] - e[0][2]) * tt + (Math.random() - 0.5) * 0.06
    }

    // ---- VORTEX (swirling 3-arm spiral galaxy) ----
    {
      const rr = Math.pow(Math.random(), 0.5) * 3.0
      const arm = Math.floor(Math.random() * 3)
      const theta = arm * ((Math.PI * 2) / 3) + rr * 1.6 + (Math.random() - 0.5) * 0.28
      vortex[i3] = Math.cos(theta) * rr
      vortex[i3 + 1] = Math.sin(theta) * rr
      vortex[i3 + 2] = (Math.random() - 0.5) * 0.6 + Math.sin(rr * 3.0) * 0.25
    }

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

  return { torus, tunnel, cloud, sun, portal, heroAlt, vortex, rand }
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
  attribute vec3 aHeroAlt;
  attribute vec3 aVortex;
  attribute float aRandom;
  uniform float uHeroA;
  uniform float uHeroB;
  uniform float uHeroT;
  varying float vR;
  vec3 heroShape(float idx) {
    if (idx < 0.5) return position;
    else if (idx < 1.5) return aHeroAlt;
    return aVortex;
  }
  void main() {
    vec3 heroPos = mix(heroShape(uHeroA), heroShape(uHeroB), uHeroT);
    vec3 pA; vec3 pB;
    if (uSeg < 0.5) { pA = heroPos; pB = aTunnel; }
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
  const heroTimeRef = useRef(0)
  const shapes = useMemo(() => buildShapes(), [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(shapes.torus, 3))
    g.setAttribute('aTunnel', new THREE.BufferAttribute(shapes.tunnel, 3))
    g.setAttribute('aCloud', new THREE.BufferAttribute(shapes.cloud, 3))
    g.setAttribute('aSun', new THREE.BufferAttribute(shapes.sun, 3))
    g.setAttribute('aPortal', new THREE.BufferAttribute(shapes.portal, 3))
    g.setAttribute('aHeroAlt', new THREE.BufferAttribute(shapes.heroAlt, 3))
    g.setAttribute('aVortex', new THREE.BufferAttribute(shapes.vortex, 3))
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
        uHeroA: { value: 0 },
        uHeroB: { value: 1 },
        uHeroT: { value: 0 },
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
    // TIME-BASED HERO SHAPE CYCLE: toroid -> hypercube -> vortex -> ... (while not scrolled)
    if (p < 0.04) {
      heroTimeRef.current += delta
      const hold = 2.2, morph = 0.95, segLen = hold + morph
      const phase = heroTimeRef.current
      const idx = Math.floor(phase / segLen) % 3
      const lt = (phase % segLen) - hold
      const tt = lt < 0 ? 0 : Math.min(1, lt / morph)
      m.uniforms.uHeroA.value = idx
      m.uniforms.uHeroB.value = (idx + 1) % 3
      m.uniforms.uHeroT.value = smoothstep(tt)
    }
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
function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch (e) {
    return false
  }
}

export default function Scene3D({ progressRef }) {
  const [ready, setReady] = useState(false)
  const [webgl, setWebgl] = useState(true)

  // Only mount the Canvas on the client, after the first paint, so we never
  // create a WebGL context during SSR/hydration transients (avoids the R3F
  // "reading 'alpha'" crash when a second/null context is handed to the composer).
  useEffect(() => {
    setWebgl(hasWebGL())
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  if (!ready) return <div className="h-full w-full bg-black" />
  if (!webgl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="h-64 w-64 rounded-full bg-[#00E5FF]/20 blur-3xl" />
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
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
