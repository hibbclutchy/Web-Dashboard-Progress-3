'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import BudgetCard from '../components/BudgetCard'
import { useTheme } from '../components/ThemeProvider'

type RibbonTone = 'toska' | 'kuning' | 'oranye' | 'merah' | 'ungu'
type Menu = { commodity: string; path: string; tone: RibbonTone }

const menus: Menu[] = [
  { commodity: 'Kedelai', path: 'dashboardkedelai', tone: 'toska' },
  { commodity: 'Kacang Hijau', path: 'dashboardkacanghijau', tone: 'kuning' },
  { commodity: 'Kacang Tanah', path: 'dashboardkacangtanah', tone: 'oranye' },
  { commodity: 'Ubi Kayu', path: 'dashboardubikayu', tone: 'merah' },
  { commodity: 'Ubi Jalar', path: 'dashboardubijalar', tone: 'ungu' },
]

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> }
}

const nextPaint = () => new Promise<void>(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
})

export default function Home() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const openDashboard = (path: string) => {
    const navigate = async () => {
      router.push(`/${path}`)
      await nextPaint()
    }
    const viewTransition = (document as ViewTransitionDocument).startViewTransition
    if (!reducedMotion && viewTransition) viewTransition.call(document, navigate)
    else router.push(`/${path}`)
  }

  return (
    <main className="min-h-screen bg-canvas text-ink transition-colors duration-500 dark:bg-navy dark:text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="AKABI beranda" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-akabi-removebg-preview.png" alt="Logo AKABI" className="h-11 w-11 rounded-2xl bg-white p-1.5 shadow-soft" />
          <span className="hidden text-xs font-bold tracking-[.28em] text-ink/70 sm:block dark:text-white/75">ANEKA KACANG DAN UMBI</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className="glass grid h-11 w-11 place-items-center rounded-2xl text-ink backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-soft dark:text-white"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <BudgetCard />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 lg:px-12 lg:pb-16 lg:pt-14">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.24em] text-ink/55 dark:text-white/60">Ruang informasi komoditas pangan</p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[.9] tracking-[-.055em] sm:text-7xl">Selamat<br />Datang!</h1>
          <p className="mt-6 text-sm font-semibold tracking-[.24em] text-ink/65 dark:text-white/70">DASHBOARD AKABI!</p>
        </div>

        <div className="commodity-card-list mt-12">
          {menus.map(menu => (
            <button
              key={menu.path}
              type="button"
              onMouseEnter={() => router.prefetch(`/${menu.path}`)}
              onFocus={() => router.prefetch(`/${menu.path}`)}
              onClick={() => openDashboard(menu.path)}
              aria-label={`Buka dashboard ${menu.commodity}`}
              className={`commodity-card commodity-card--${menu.tone} group focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/50 dark:focus-visible:ring-white/60`}
              style={{ viewTransitionName: `commodity-card-${menu.path}` } as CSSProperties}
            >
              <span className="commodity-card__ribbon" aria-hidden="true">
                <span className="commodity-card__ribbon-label">{menu.commodity}</span>
              </span>

              <span className="commodity-card__content">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-akabi-removebg-preview.png" alt="" className="commodity-card__icon transition duration-300 group-hover:scale-105" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
