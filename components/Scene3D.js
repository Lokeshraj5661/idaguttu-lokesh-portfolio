'use client'

/* eslint-disable react/no-unknown-property */

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
  const shield = new Float32Array(COUNT * 3)
  const lock = new Float32Array(COUNT * 3)
  const eye = new Float32Array(COUNT * 3)
  const rand = new Float32Array(COUNT)
  const role = new Float32Array(COUNT)

  const tilt = 0.62
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const rays = 16
  const shieldPolygon = [
    [0, 2.9],
    [2.35, 1.35],
    [2.05, -1.25],
    [0, -2.8],
    [-2.05, -1.25],
    [-2.35, 1.35],
  ]
  const pointOnPolygon = (edge, t, scale = 1) => {
    const a = shieldPolygon[edge % shieldPolygon.length]
    const b = shieldPolygon[(edge + 1) % shieldPolygon.length]
    return [
      (a[0] + (b[0] - a[0]) * t) * scale,
      (a[1] + (b[1] - a[1]) * t) * scale,
    ]
  }

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3
    rand[i] = Math.random()

    // ---- TORUS (initial hero state), centered and tilted ----
    {
      const u = Math.random() * Math.PI * 2
      const v = Math.random() * Math.PI * 2
      const R = 2.6
      const r = 0.95 * (0.82 + Math.random() * 0.18)
      const x = (R + r * Math.cos(v)) * Math.cos(u)
      const y = (R + r * Math.cos(v)) * Math.sin(u)
      const z = r * Math.sin(v)
      torus[i3] = x
      torus[i3 + 1] = y * cosT - z * sinT
      torus[i3 + 2] = y * sinT + z * cosT
    }

    // ---- CRYPTOGRAPHIC SHIELD: perimeter, radial webs and nested layers ----
    {
      const mode = Math.random()
      let sx
      let sy
      if (mode < 0.38) {
        ;[sx, sy] = pointOnPolygon(Math.floor(Math.random() * 6), Math.random(), 1)
      } else if (mode < 0.70) {
        const edgePoint = pointOnPolygon(Math.floor(Math.random() * 6), Math.random(), 1)
        const centerT = Math.random() * 0.9 + 0.05
        sx = edgePoint[0] * centerT
        sy = edgePoint[1] * centerT
      } else {
        ;[sx, sy] = pointOnPolygon(Math.floor(Math.random() * 6), Math.random(), 0.28 + Math.random() * 0.52)
      }
      shield[i3] = sx + (Math.random() - 0.5) * 0.045
      shield[i3 + 1] = sy + (Math.random() - 0.5) * 0.045
      shield[i3 + 2] = (Math.random() - 0.5) * 0.48
    }

    // ---- QUANTUM LOCK: body nodes, arching shackle and rotating dials ----
    {
      const mode = Math.random()
      if (mode < 0.45) {
        lock[i3] = (Math.random() - 0.5) * 3.4
        lock[i3 + 1] = -0.45 + (Math.random() - 0.5) * 2.4
        lock[i3 + 2] = 0.25 + (Math.random() - 0.5) * 0.35
      } else if (mode < 0.68) {
        const edge = Math.floor(Math.random() * 4)
        const t = Math.random()
        const x = edge === 0 || edge === 2 ? (Math.random() - 0.5) * 3.7 : (edge === 1 ? 1.75 : -1.75)
        const y = edge === 0 || edge === 2 ? (edge === 0 ? 0.78 : -1.68) : -1.68 + t * 2.46
        lock[i3] = edge === 0 || edge === 2 ? x : x
        lock[i3 + 1] = y
        lock[i3 + 2] = 0.34 + (Math.random() - 0.5) * 0.22
      } else if (mode < 0.86) {
        const theta = Math.PI * Math.random()
        lock[i3] = Math.cos(theta) * 1.48
        lock[i3 + 1] = 0.94 + Math.sin(theta) * 1.55
        lock[i3 + 2] = (Math.random() - 0.5) * 0.22
      } else {
        const ring = Math.floor(Math.random() * 3)
        const theta = Math.random() * Math.PI * 2
        const radius = 0.42 + ring * 0.24
        lock[i3] = Math.cos(theta) * radius
        lock[i3 + 1] = -0.48 + Math.sin(theta) * radius
        lock[i3 + 2] = 0.62 + (Math.random() - 0.5) * 0.08
        role[i] = 2
      }
    }

    // ---- AUTONOMOUS RADAR EYE: globe wireframe, eye contours, iris and pupil ----
    {
      const mode = Math.random()
      if (mode < 0.34) {
        const theta = Math.random() * Math.PI
        const upper = Math.random() < 0.5 ? 1 : -1
        eye[i3] = Math.cos(theta) * 3.25
        eye[i3 + 1] = upper * Math.sin(theta) * 1.25
        eye[i3 + 2] = 0.05 + (Math.random() - 0.5) * 0.12
      } else if (mode < 0.63) {
        const longitude = Math.random() * Math.PI * 2
        const latitude = (Math.random() - 0.5) * Math.PI
        const radius = 3.05
        eye[i3] = Math.cos(latitude) * Math.cos(longitude) * radius
        eye[i3 + 1] = Math.sin(latitude) * radius * 0.72
        eye[i3 + 2] = Math.cos(latitude) * Math.sin(longitude) * radius * 0.48 - 0.2
      } else if (mode < 0.86) {
        const theta = Math.random() * Math.PI * 2
        const radius = 0.52 + Math.floor(Math.random() * 3) * 0.22
        eye[i3] = Math.cos(theta) * radius
        eye[i3 + 1] = Math.sin(theta) * radius * 0.78
        eye[i3 + 2] = 0.62 + (Math.random() - 0.5) * 0.08
      } else {
        const theta = Math.random() * Math.PI * 2
        const radius = Math.sqrt(Math.random()) * 0.34
        eye[i3] = Math.cos(theta) * radius
        eye[i3 + 1] = Math.sin(theta) * radius * 0.78
        eye[i3 + 2] = 0.72 + (Math.random() - 0.5) * 0.08
        role[i] = 1
      }
    }

    // ---- TUNNEL (about) long cylinder along Z, shifted right ----
    {
      const a = Math.random() * Math.PI * 2
      const zpos = -12 + Math.random() * 18
      const flare = 1.7 + (zpos + 12) / 18 * 0.6 + (Math.random() - 0.5) * 0.25
      tunnel[i3] = Math.cos(a) * flare + 2.1
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
      let ang
      let radius
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
      portal[i3] = sx * 1.2 + 3.7
      portal[i3 + 1] = sy * 1.2
      portal[i3 + 2] = sz
    }
  }

  return { torus, tunnel, cloud, sun, portal, shield, lock, eye, rand, role }
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
  attribute vec3 aShield;
  attribute vec3 aLock;
  attribute vec3 aEye;
  attribute float aRandom;
  attribute float aRole;
  uniform float uHeroA;
  uniform float uHeroB;
  uniform float uHeroT;
  varying float vR;
  varying float vEdge;

  vec3 heroShape(float idx) {
    if (idx < 0.5) return position;
    if (idx < 1.5) return aShield;
    if (idx < 2.5) return aLock;
    return aEye;
  }

  vec3 swirl(vec3 pos, float phase) {
    float scatter = sin(uHeroT * 3.14159) * (0.32 + 0.48 * aRandom);
    float angle = phase * (0.9 + aRandom * 1.8) + uTime * 0.08;
    float c = cos(angle);
    float s = sin(angle);
    vec2 rotated = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
    pos.xy = mix(pos.xy, rotated, sin(uHeroT * 3.14159) * 0.72);
    pos += vec3(sin(angle * 1.7), cos(angle * 1.3), sin(angle * 1.1)) * scatter;
    return pos;
  }

  void main() {
    vec3 heroPos = mix(heroShape(uHeroA), heroShape(uHeroB), uHeroT);
    heroPos = swirl(heroPos, (aRandom - 0.5) * 2.0);

    // The pupil particles scan across the eye while the eye target is active.
    float eyeWeight = 0.0;
    if (uHeroA > 2.5) eyeWeight += 1.0 - uHeroT;
    if (uHeroB > 2.5) eyeWeight += uHeroT;
    if (aRole > 0.5 && aRole < 1.5) heroPos.x += sin(uTime * 1.5) * 0.62 * eyeWeight;

    float shieldWeight = 0.0;
    if (uHeroA > 0.5 && uHeroA < 1.5) shieldWeight += 1.0 - uHeroT;
    if (uHeroB > 0.5 && uHeroB < 1.5) shieldWeight += uHeroT;
    heroPos.xy *= 1.0 + sin(uTime * 3.0) * 0.028 * shieldWeight;

    float lockWeight = 0.0;
    if (uHeroA > 1.5 && uHeroA < 2.5) lockWeight += 1.0 - uHeroT;
    if (uHeroB > 1.5 && uHeroB < 2.5) lockWeight += uHeroT;
    if (aRole > 1.5 && lockWeight > 0.0) {
      float dialAngle = uTime * (aRandom > 0.5 ? 1.15 : -1.15) * lockWeight;
      float dc = cos(dialAngle);
      float ds = sin(dialAngle);
      vec2 dial = heroPos.xy - vec2(0.0, -0.48);
      heroPos.xy = vec2(dial.x * dc - dial.y * ds, dial.x * ds + dial.y * dc) + vec2(0.0, -0.48);
    }

    vec3 pA;
    vec3 pB;
    if (uSeg < 0.5) { pA = heroPos; pB = aTunnel; }
    else if (uSeg < 1.5) { pA = aTunnel; pB = aCloud; }
    else if (uSeg < 2.5) { pA = aCloud; pB = aSun; }
    else { pA = aSun; pB = aPortal; }
    vec3 pos = mix(pA, pB, uT);
    float w = uTime * 0.6 + aRandom * 6.2831;
    pos += vec3(sin(w), cos(w * 1.1), sin(w * 0.7)) * 0.045;
    vR = aRandom;
    vEdge = clamp(length(pos.xy) / 3.2 + abs(pos.z) / 4.0, 0.0, 1.0);
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
  varying float vEdge;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);
    float edgeGlow = smoothstep(0.25, 0.95, vEdge);
    vec3 col = mix(uColor, vec3(1.0), core * 0.75 + edgeGlow * 0.16);
    float a = glow * glow * uOpacity * (0.55 + 0.45 * vR) * (0.85 + edgeGlow * 0.7);
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
  const heroScrollRef = useRef(false)
  const shapes = useMemo(() => buildShapes(), [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(shapes.torus, 3))
    g.setAttribute('aTunnel', new THREE.BufferAttribute(shapes.tunnel, 3))
    g.setAttribute('aCloud', new THREE.BufferAttribute(shapes.cloud, 3))
    g.setAttribute('aSun', new THREE.BufferAttribute(shapes.sun, 3))
    g.setAttribute('aPortal', new THREE.BufferAttribute(shapes.portal, 3))
    g.setAttribute('aShield', new THREE.BufferAttribute(shapes.shield, 3))
    g.setAttribute('aLock', new THREE.BufferAttribute(shapes.lock, 3))
    g.setAttribute('aEye', new THREE.BufferAttribute(shapes.eye, 3))
    g.setAttribute('aRandom', new THREE.BufferAttribute(shapes.rand, 1))
    g.setAttribute('aRole', new THREE.BufferAttribute(shapes.role, 1))
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
        uHeroB: { value: 0 },
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
    // A scroll is a one-way override: freeze the current cyber form and let the
    // existing scroll interpolation dissolve it into the about tunnel.
    if (p > 0.008) heroScrollRef.current = true
    if (!heroScrollRef.current && p < 0.04) {
      heroTimeRef.current += delta
      const intro = 3.0
      const interval = 4.0
      const morph = 1.5
      const elapsed = heroTimeRef.current

      if (elapsed < intro) {
        m.uniforms.uHeroA.value = 0
        m.uniforms.uHeroB.value = 0
        m.uniforms.uHeroT.value = 0
      } else {
        const cycle = Math.floor((elapsed - intro) / interval)
        const phase = (elapsed - intro) - cycle * interval
        const from = cycle === 0 ? 0 : 1 + ((cycle - 1) % 3)
        const to = 1 + (cycle % 3)
        const transition = Math.min(1, phase / morph)
        m.uniforms.uHeroA.value = transition < 1 ? from : to
        m.uniforms.uHeroB.value = to
        m.uniforms.uHeroT.value = transition < 1 ? smoothstep(transition) : 0
      }
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
