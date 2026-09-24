'use client'

import Link from 'next/link'
import { Moon, Sun } from 'lucide-react'
import BudgetCard from '../components/BudgetCard'
import CommodityCards from '../components/CommodityCards'
import { useTheme } from '../components/ThemeProvider'

export default function Home() {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="min-h-screen bg-canvas text-ink transition-colors duration-500 dark:bg-navy dark:text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="AKABI beranda" className="flex items-center gap-3">
          <span className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white p-1.5 shadow-soft">
            <span className="sr-only">Logo AKABI</span>
            {/* The landing header keeps the existing compact brand mark. */}
            <img src="/logo-akabi-removebg-preview.png" alt="" className="h-full w-full object-contain" />
          </span>
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
        <div className="max-w-none">
          <p className="text-sm font-bold uppercase tracking-[.24em] text-ink/55 dark:text-white/60">Ruang informasi komoditas pangan</p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[.9] tracking-[-.055em] sm:text-7xl">Selamat Datang!</h1>
          <p className="mt-6 text-sm font-semibold tracking-[.24em] text-ink/65 dark:text-white/70">DASHBOARD AKABI!</p>
        </div>

        <div className="mt-12">
          <CommodityCards />
        </div>
      </section>
    </main>
  )
}
