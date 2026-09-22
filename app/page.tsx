'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, Bean, Sprout, Wheat } from 'lucide-react'
import { useGLTF } from '@react-three/drei'
import BudgetCard from '../components/BudgetCard'

const CommodityModel3D = dynamic(() => import('../components/CommodityModel3D'), {
  ssr: false,
  loading: () => <div className="grid h-full min-h-[390px] place-items-center" aria-label="Memuat model"><span className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" /></div>,
})

type Menu = { commodity: string; path: string; icon: LucideIcon; model: string; color: string }

const menus: Menu[] = [
  { commodity: 'Kedelai', path: 'dashboardkedelai', icon: Bean, model: '/models/kedelai.glb', color: '#6b8e23' },
  { commodity: 'Kacang Tanah', path: 'dashboardkacangtanah', icon: Bean, model: '/models/kacangtanah.glb', color: '#b5651d' },
  { commodity: 'Kacang Hijau', path: 'dashboardkacanghijau', icon: Bean, model: '/models/kacangijo.glb', color: '#2e9e5b' },
  { commodity: 'Ubi Kayu', path: 'dashboardubikayu', icon: Sprout, model: '/models/ubikayu.glb', color: '#a1673f' },
  { commodity: 'Ubi Jalar', path: 'dashboardubijalar', icon: Sprout, model: '/models/ubijalar.glb', color: '#8e44ad' },
  { commodity: 'Jagung', path: 'dashboardjagung', icon: Wheat, model: '/models/jagung.glb', color: '#f59e0b' },
]

const preloaded = new Set<string>()
const MODEL_SWITCH_DEBOUNCE_MS = 100

function preloadModel(src: string) {
  if (preloaded.has(src)) return
  preloaded.add(src)
  useGLTF.preload(src)
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [modelIndex, setModelIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const active = menus[activeIndex]
  const switchTimer = useRef<number | null>(null)
  const transitionStartedAt = useRef<number | null>(null)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(motion.matches)
    sync()
    motion.addEventListener('change', sync)
    return () => motion.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const preloadAll = () => menus.forEach(menu => preloadModel(menu.model))
    const idle = window.requestIdleCallback?.(preloadAll, { timeout: 1800 })
    const fallback = idle === undefined ? window.setTimeout(preloadAll, 1800) : undefined
    return () => { if (idle !== undefined) window.cancelIdleCallback?.(idle); if (fallback) window.clearTimeout(fallback) }
  }, [])

  useEffect(() => {
    if (transitionStartedAt.current === null) return
    const startedAt = transitionStartedAt.current
    transitionStartedAt.current = null
    requestAnimationFrame(() => {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[AKABI] commodity switch committed in ${(performance.now() - startedAt).toFixed(1)}ms (React + first frame)`)
      }
    })
  }, [modelIndex])

  useEffect(() => () => {
    if (switchTimer.current !== null) window.clearTimeout(switchTimer.current)
  }, [])

  const choose = useCallback((index: number) => {
    if (switchTimer.current !== null) window.clearTimeout(switchTimer.current)
    setActiveIndex(index)
    transitionStartedAt.current = performance.now()

    // Only the latest click is applied after the short heavy-work debounce.
    switchTimer.current = window.setTimeout(() => {
      setModelIndex(index)
      switchTimer.current = null
    }, MODEL_SWITCH_DEBOUNCE_MS)
  }, [])

  const displayedModel = menus[modelIndex]

  const focusModel = (src: string) => {
    preloadModel(src)
  }

  const transitionClass = modelIndex % 2 === 0 ? 'model-transition-a' : 'model-transition-b'


  return (
    <main
      className="relative min-h-screen overflow-hidden text-white selection:bg-white/30"
      style={{ background: `radial-gradient(circle at 50% 76%, ${active.color} 0%, ${active.color}cc 24%, #07120f 72%, #030806 100%)`, transition: 'background 900ms ease' }}
    >
      <style jsx>{`\n        .model-transition-a, .model-transition-b { animation: model-in 700ms cubic-bezier(.22,.8,.24,1) both; }\n        @keyframes model-in { from { opacity: 0; transform: translate3d(0, 45px, 0) scale(.97); } to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); } }\n        @media (prefers-reduced-motion: reduce) { .model-transition-a, .model-transition-b { animation: none; } }\n      `}</style>

      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="AKABI beranda" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-akabi-removebg-preview.png" alt="Logo AKABI" className="h-11 w-11 rounded-2xl bg-white/90 p-1.5 shadow-2xl" />
          <span className="hidden text-xs font-bold tracking-[.28em] text-white/80 sm:block">ANEKA KACANG DAN UMBI</span>
        </Link>
        <div className="[&_.glass]:!border-white/20 [&_.glass]:!bg-white/10 [&_.glass]:!shadow-none [&_h1]:!text-white [&_h2]:!text-white [&_h1]:!text-xs [&_h2]:!text-sm">
          <BudgetCard />
        </div>
      </header>

      <section className="relative mx-auto flex min-h-[calc(100vh-82px)] max-w-[1500px] flex-col justify-between px-5 pb-7 pt-3 sm:px-8 lg:px-12">
        <div className="relative z-10 grid flex-1 grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_1.35fr_1fr]">
          <div className="max-w-sm self-center pt-12 lg:pt-0">
            <h1 className="max-w-xs text-4xl font-black uppercase leading-[.9] tracking-[-.045em] sm:text-5xl lg:text-6xl">Selamat<br />Datang!</h1>
            <p className="mt-5 max-w-[220px] text-sm font-medium tracking-[.18em] text-white/75">DASHBOARD AKABI!</p>
          </div>

          <div className="relative order-first h-[45vh] min-h-[330px] w-full lg:order-none lg:h-[65vh]">
            <div key={`${displayedModel.model}-${modelIndex}`} className={`absolute inset-0 z-10 ${transitionClass}`}>
              <CommodityModel3D src={displayedModel.model} icon={displayedModel.icon} reducedMotion={reducedMotion} />
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 self-start pt-5 lg:items-end lg:pt-16">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-white/70">Pilih Komoditas</p>
            <div className="flex max-w-[260px] flex-wrap gap-3 lg:justify-end" role="tablist" aria-label="Pilih komoditas">
              {menus.map((menu, index) => {
                const selected = index === activeIndex
                return <button key={menu.commodity} type="button" role="tab" aria-selected={selected} aria-label={`Pilih komoditas ${menu.commodity}`} onFocus={() => focusModel(menu.model)} onClick={() => choose(index)} className={`min-h-12 rounded-full border px-3 py-2 text-center text-[11px] font-semibold leading-tight transition-all duration-300 sm:text-xs ${selected ? 'scale-110 border-white bg-white text-[#18372a] shadow-[0_0_0_5px_rgba(255,255,255,.18)]' : 'border-white/35 bg-black/15 text-white/75 hover:scale-105 hover:border-white hover:bg-white/15'}`}>{menu.commodity}</button>
              })}
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-end">
          <Link href={`/${active.path}`} className="group inline-flex items-center gap-5 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#18372a] shadow-2xl transition-transform duration-300 hover:-translate-y-1 sm:px-6 sm:py-4">
            Lihat Dashboard <span className="grid h-8 w-8 place-items-center rounded-full bg-[#18372a] text-white transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={16} /></span>
          </Link>
        </div>
      </section>
    </main>
  )
}





