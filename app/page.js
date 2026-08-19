'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ArrowUpRight, ArrowDown, Network, Share2, GitBranch, Waves, Linkedin, Github, Instagram, Loader2, Check, Sparkles } from 'lucide-react'

const Scene3D = dynamic(() => import('@/components/Scene3D'), { ssr: false })

const RESUME_URL =
  'https://customer-assets-jai6qajn.emergentagent.net/job_ai-engineer-3d-5/artifacts/5dc67h7b_2300089004%20Idaguttu%20Lokesh.pdf'
const EMAIL = '2300089004aids@gmail.com'
const LINKEDIN = 'https://www.linkedin.com/in/lokesh-idaguttu-93a70b36a?utm_source=share_via&utm_content=profile&utm_medium=member_android'
const GITHUB = 'https://github.com/Lokeshraj5661'
const INSTAGRAM = 'https://www.instagram.com/__lokesh_i?igsh=bjN5djBwZ2k3djR6'

// opacity band helper: ramp up s0->s1, hold s1->s2, ramp down s2->s3
function band(p, s0, s1, s2, s3) {
  if (p < s0 || p > s3) return 0
  if (p < s1) return (p - s0) / (s1 - s0)
  if (p < s2) return 1
  return 1 - (p - s2) / (s3 - s2)
}

const PROJECTS = [
  {
    icon: Network,
    title: 'Asset Manager',
    label: 'Primary',
    desc: 'A structured asset management system — data flows, tracking and inventory intelligence built for clarity and control.',
    tags: ['Full-Stack', 'Data Flow', 'Dashboard'],
    url: 'https://asset-manager--lugertarak39.replit.app/',
  },
  {
    icon: Share2,
    title: 'Realtime Architecture',
    label: 'Platform',
    desc: '5-Star Hospitality & Reservation Platform — immersive 3D scrollytelling, realtime WebSockets and connected architecture.',
    tags: ['Next.js 14', 'React Three Fiber', 'Supabase', 'Realtime'],
    url: 'https://zip-extractor-63.preview.emergentagent.com/?utm_source=share',
  },
  {
    icon: GitBranch,
    title: 'Phishing Email Detection',
    label: 'AI / NLP',
    desc: 'A machine-learning system that flags phishing emails in real time using Python, Scikit-Learn & NLP feature pipelines.',
    tags: ['Python', 'Scikit-Learn', 'NLP', 'ML'],
    url: 'https://asset-manager--thorloke45.replit.app/',
  },
]

const SKILLS = [
  'React.js', 'Next.js 14', 'Spring Boot', 'Python', 'Scikit-Learn',
  'NLP', 'AWS', 'MySQL', 'Supabase', 'HTML/CSS/JS',
]

const NAV = [
  { label: 'ABOUT', target: 0.30 },
  { label: 'PROJECTS', target: 0.58 },
  { label: 'SKILLS', target: 0.80 },
]

export default function App() {
  const progressRef = useRef(0)
  const [p, setP] = useState(0)
  const [open, setOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const h = document.documentElement
        const max = h.scrollHeight - h.clientHeight
        const val = max > 0 ? h.scrollTop / max : 0
        progressRef.current = val
        setP(val)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = useCallback((frac) => {
    const h = document.documentElement
    const max = h.scrollHeight - h.clientHeight
    window.scrollTo({ top: frac * max, behavior: 'smooth' })
  }, [])

  // scene opacities
  const heroO = band(p, -1, 0, 0.10, 0.19)
  const aboutO = band(p, 0.20, 0.27, 0.40, 0.48)
  const projO = band(p, 0.46, 0.53, 0.66, 0.72)
  const philoO = band(p, 0.70, 0.76, 0.84, 0.90)
  const footO = band(p, 0.88, 0.94, 1.1, 1.2)

  return (
    <main className="relative isolate bg-black text-white">
      {/* Three.js background: visually behind content and never intercepts UI clicks. */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Scene3D progressRef={progressRef} />
      </div>

      {/* subtle vignette */}
      <div className="pointer-events-none fixed inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 md:px-12 py-6">
        <button onClick={() => scrollTo(0)} className="text-lg font-semibold tracking-[0.25em] text-white">
          LOKESH
        </button>
        <div className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.28em] text-white/60">
          {NAV.map((n) => (
            <button key={n.label} onClick={() => scrollTo(n.target)} className="hover:text-white transition-colors">
              {n.label}
            </button>
          ))}
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white hover:text-[#00E5FF] transition-colors"
          >
            RESUME <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden flex items-center gap-1 text-[11px] tracking-[0.2em]"
        >
          RESUME <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </nav>

      {/* ================= OVERLAYS (fixed) ================= */}

      {/* SCENE 1 — HERO */}
      <div
        className="fixed inset-0 z-20 pointer-events-none"
        style={{ opacity: heroO, transition: 'opacity 0.15s linear', visibility: heroO <= 0.01 ? 'hidden' : 'visible' }}
      >
        <div className="absolute bottom-24 left-6 md:left-12 max-w-md">
          <p className="text-[11px] tracking-[0.3em] text-[#00E5FF] mb-4">// AI &amp; DATA SCIENCE</p>
          <NameReveal />
          <p className="text-xl md:text-2xl font-light leading-snug text-white/70">
            Engineering meets intelligence in 3D space.
          </p>
        </div>
        <div className="absolute bottom-24 right-6 md:right-12 max-w-xs text-right">
          <p className="text-[11px] leading-relaxed tracking-[0.15em] text-white/50">
            A MODERN DEVELOPER BUILT FOR AI &amp; FULL-STACK—MINIMAL, DYNAMIC, AND DEEPLY INTERACTIVE. MAKE YOUR PRESENCE
            FEEL INTELLIGENT FROM THE VERY FIRST PIXEL.
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => scrollTo(0.58)}
              className="rounded-full border border-[#00E5FF]/50 bg-[#00E5FF]/10 px-6 py-2.5 text-[11px] tracking-[0.25em] text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-colors"
            >
              EXPLORE PORTFOLIO
            </button>
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-5 py-2.5 text-[11px] tracking-[0.2em] text-white/80 hover:border-[#00E5FF]/60 hover:text-[#00E5FF] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              ASK PORTFOLIO AI
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/40">
            SCROLL DOWN <ArrowDown className="h-3 w-3 animate-bounce" />
          </div>
        </div>
      </div>

      {/* SCENE 2 — ABOUT */}
      <div
        className="fixed inset-0 z-20 pointer-events-none flex items-center"
        style={{ opacity: aboutO, transition: 'opacity 0.15s linear', visibility: aboutO <= 0.01 ? 'hidden' : 'visible' }}
      >
        <div className="px-6 md:px-12 max-w-xl">
          <p className="text-[11px] tracking-[0.3em] text-[#00E5FF] mb-5">// ABOUT</p>
          <p className="text-2xl md:text-4xl font-light leading-snug text-white/90">
            Lokesh is an AI &amp; Data Science engineer—a synthetic mind crafted to design and develop intelligent
            systems. I don&apos;t just write code; I architect solutions blending advanced backend frameworks with
            responsive frontends to match complexity, speed, and ambition.
          </p>
        </div>
      </div>

      {/* SCENE 3 — PROJECTS */}
      <div
        className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-center px-6 md:px-12"
        style={{ opacity: projO, transition: 'opacity 0.15s linear', visibility: projO <= 0.01 ? 'hidden' : 'visible' }}
      >
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl md:text-5xl font-light leading-tight">
            Lokesh isn&apos;t just a coder—
            <br />
            he&apos;s an autonomous developer with a structural language.
          </h2>
          <p className="mt-4 max-w-lg text-[11px] leading-relaxed tracking-[0.15em] text-white/45">
            HE INTERPRETS DATA, FORM, AND FUNCTION TO GENERATE IMMERSIVE WEB EXPERIENCES. HE DOESN&apos;T JUST BUILD—HE
            THINKS IN SYSTEMS.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl pointer-events-auto">
          {PROJECTS.map((proj, i) => {
            const Icon = proj.icon
            return (
              <a
                key={proj.title + i}
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-[#00E5FF]/50 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition-colors group-hover:text-[#00E5FF]" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">{proj.title}</h3>
                  <span className="rounded-full border border-[#00E5FF]/30 px-2 py-0.5 text-[8px] tracking-[0.15em] text-[#00E5FF]/80">
                    {proj.label}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-white/50">{proj.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {proj.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[9px] tracking-wider text-white/40">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-[10px] tracking-[0.2em] text-[#00E5FF]/70 group-hover:text-[#00E5FF]">
                  VIEW PROJECT <ArrowUpRight className="h-3 w-3" />
                </span>
              </a>
            )
          })}
        </div>
      </div>

      {/* SCENE 4 — PHILOSOPHY */}
      <div
        className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center text-center"
        style={{ opacity: philoO, transition: 'opacity 0.15s linear', visibility: philoO <= 0.01 ? 'hidden' : 'visible' }}
      >
        <div className="max-w-3xl px-6">
          <h2 className="text-4xl md:text-6xl font-light leading-tight">
            Code isn&apos;t just static.
            <br />
            <span className="text-[#00E5FF]">It learns, evolves, and adapts intelligently.</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 pointer-events-auto">
            {SKILLS.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[11px] tracking-[0.12em] text-white/70 backdrop-blur-sm hover:border-[#00E5FF]/50 hover:text-[#00E5FF] transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SCENE 5 — FOOTER / CTA */}
      <div
        className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-center"
        style={{ opacity: footO, transition: 'opacity 0.15s linear', visibility: footO <= 0.01 ? 'hidden' : 'visible' }}
      >
        <div className="px-6 md:px-12 max-w-lg">
          <h2 className="text-5xl md:text-7xl font-light leading-[1.05]">
            Deploy
            <br />
            with Lokesh
          </h2>
          <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="rounded-full bg-white px-8 py-3 text-[12px] font-medium tracking-[0.2em] text-black hover:bg-[#00E5FF] transition-colors"
            >
              GET IN TOUCH
            </button>
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-2 rounded-full border border-[#00E5FF]/50 bg-[#00E5FF]/10 px-6 py-3 text-[12px] font-medium tracking-[0.16em] text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              ASK PORTFOLIO AI
            </button>
            <div className="flex items-center gap-4 text-white/60">
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-[#00E5FF] transition-colors">
                <Github className="h-6 w-6" />
              </a>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-[#00E5FF] transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-[#00E5FF] transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 border-t border-white/10 px-6 md:px-12 py-5 text-[10px] tracking-[0.2em] text-white/40">
          © 2026 — IDAGUTTU LOKESH. ALL RIGHTS RESERVED
        </div>
      </div>

      {/* Scroll spacer */}
      <div style={{ height: '600vh' }} />

      {/* Persistent AI entry point: always above the 3D background, including after scroll. */}
      {!aiOpen && <PortfolioAILauncher onOpen={() => setAiOpen(true)} />}

      {/* Chatbot and contact modals */}
      {open && <ContactModal onClose={() => setOpen(false)} />}
      {aiOpen && <PortfolioAIModal onClose={() => setAiOpen(false)} />}
    </main>
  )
}

function NameReveal() {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const letters = ref.current.querySelectorAll('[data-letter]')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        letters,
        {
          opacity: 0,
          filter: 'blur(14px)',
          x: () => (Math.random() - 0.5) * 320,
          y: () => (Math.random() - 0.5) * 240,
          rotate: () => (Math.random() - 0.5) * 60,
          scale: 0.4,
        },
        {
          opacity: 1,
          filter: 'blur(0px)',
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          stagger: { each: 0.05, from: 'random' },
          delay: 0.25,
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  const renderWord = (word) =>
    word.split('').map((ch, i) => (
      <span key={i} data-letter className="inline-block">
        {ch}
      </span>
    ))

  return (
    <h1 ref={ref} className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight mb-4">
      <span className="block">{renderWord('IDAGUTTU')}</span>
      <span className="block">{renderWord('LOKESH')}</span>
    </h1>
  )
}

function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('done')
      setTimeout(onClose, 1400)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-[#00E5FF]/20 bg-[#050505] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] tracking-[0.3em] text-[#00E5FF] mb-1">// GET IN TOUCH</p>
        <h3 className="text-2xl font-light mb-6">Let&apos;s build something intelligent.</h3>
        {status === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00E5FF]/15 text-[#00E5FF]">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-sm text-white/70">Message sent. Lokesh will reach out soon.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/50"
            />
            <input
              required
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/50"
            />
            <textarea
              required
              rows={4}
              placeholder="Your message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/50"
            />
            {status === 'error' && <p className="text-xs text-red-400">Something went wrong. Try again.</p>}
            <div className="flex items-center justify-between pt-1">
              <a href={`mailto:${EMAIL}`} className="text-[11px] tracking-wider text-white/40 hover:text-white">
                {EMAIL}
              </a>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[12px] font-medium tracking-[0.15em] text-black hover:bg-[#00E5FF] transition-colors disabled:opacity-60"
              >
                {status === 'sending' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                SEND
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


function PortfolioAILauncher({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open Portfolio AI chatbot"
      aria-haspopup="dialog"
      className="pointer-events-auto fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-[#00E5FF]/60 bg-[#031015]/95 px-5 py-3 text-[11px] font-medium tracking-[0.18em] text-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.2)] backdrop-blur-md transition-all hover:bg-[#00E5FF] hover:text-black"
    >
      <Sparkles className="h-4 w-4" />
      ASK PORTFOLIO AI
    </button>
  )
}

function PortfolioAIModal({ onClose }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState('idle') // idle | thinking | error
  const [error, setError] = useState('')

  const ask = async (e) => {
    e.preventDefault()
    const value = question.trim()
    if (value.length < 3 || value.length > 500) {
      setError('Ask a question between 3 and 500 characters.')
      setStatus('error')
      return
    }

    setStatus('thinking')
    setError('')
    setAnswer('')
    try {
      const res = await fetch('/api/portfolio-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: value }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'The assistant is temporarily unavailable.')
      setAnswer(data.answer || 'I could not find an answer for that question.')
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-ai-title"
        className="w-full max-w-lg rounded-2xl border border-[#00E5FF]/25 bg-[#050505] p-8 shadow-[0_0_80px_rgba(0,229,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-5">
          <div>
            <p className="mb-1 flex items-center gap-2 text-[11px] tracking-[0.3em] text-[#00E5FF]"><Sparkles className="h-3.5 w-3.5" /> PORTFOLIO AI</p>
            <h3 id="portfolio-ai-title" className="text-2xl font-light">Ask about Lokesh&apos;s work.</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close portfolio AI" className="text-white/40 hover:text-white">×</button>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-white/50">Ask about skills, projects, or the systems behind this experience.</p>
        <form onSubmit={ask} className="space-y-4">
          <textarea
            required
            minLength={3}
            maxLength={500}
            rows={4}
            value={question}
            disabled={status === 'thinking'}
            aria-label="Question about the portfolio"
            placeholder="Which project uses NLP?"
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/50 disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] tracking-wider text-white/30">{question.length}/500</span>
            <button
              type="submit"
              disabled={status === 'thinking' || question.trim().length < 3}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[12px] font-medium tracking-[0.15em] text-black transition-colors hover:bg-[#00E5FF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'thinking' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {status === 'thinking' ? 'THINKING' : 'ASK AI'}
            </button>
          </div>
        </form>
        {status === 'error' && <p role="alert" className="mt-5 text-sm text-red-400">{error}</p>}
        {answer && <div aria-live="polite" className="mt-6 rounded-xl border border-[#00E5FF]/15 bg-[#00E5FF]/[0.04] p-5 text-sm leading-relaxed text-white/80">{answer}</div>}
      </div>
    </div>
  )
}
