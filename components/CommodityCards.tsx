'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'

export const COMMODITIES = [
  { id: 'kedelai', name: 'Kedelai', accent: '#E8B93B', slug: 'dashboardkedelai' },
  { id: 'kacang-hijau', name: 'Kacang Hijau', accent: '#6FBF44', slug: 'dashboardkacanghijau' },
  { id: 'kacang-tanah', name: 'Kacang Tanah', accent: '#B98A4E', slug: 'dashboardkacangtanah' },
  { id: 'ubi-kayu', name: 'Ubi Kayu', accent: '#D8C6A0', slug: 'dashboardubikayu' },
  { id: 'ubi-jalar', name: 'Ubi Jalar', accent: '#7B4B94', slug: 'dashboardubijalar' },
] as const

type CommodityCardsProps = {
  activeSlug?: string
}

export default function CommodityCards({ activeSlug }: CommodityCardsProps) {
  const router = useRouter()
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative isolate">
      <div className="pointer-events-none absolute -left-12 top-6 -z-10 h-40 w-40 rounded-full bg-[#E8B93B]/20 blur-3xl dark:bg-[#E8B93B]/10" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6FBF44]/20 blur-3xl dark:bg-[#6FBF44]/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-8 bottom-0 -z-10 h-44 w-44 rounded-full bg-[#7B4B94]/20 blur-3xl dark:bg-[#7B4B94]/10" aria-hidden="true" />

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:gap-5 lg:overflow-visible">
        {COMMODITIES.map(commodity => {
          const isActive = activeSlug === commodity.slug
          const cardStyle = {
            '--accent': commodity.accent,
            background: `linear-gradient(145deg, color-mix(in srgb, ${commodity.accent} 18%, transparent), transparent 55%, color-mix(in srgb, ${commodity.accent} 10%, transparent))`,
            boxShadow: isActive
              ? `0 0 0 2px ${commodity.accent}, 0 8px 18px color-mix(in srgb, ${commodity.accent} 22%, transparent), 0 28px 65px rgba(15, 23, 42, .12)`
              : `0 2px 8px rgba(15, 23, 42, .05), 0 24px 60px color-mix(in srgb, ${commodity.accent} 18%, transparent)`,
          } as CSSProperties

          return (
            <motion.div
              key={commodity.id}
              layout
              layoutId={`commodity-${commodity.slug}`}
              transition={{ layout: { duration: reducedMotion ? 0 : 0.46, ease: [0.32, 0.72, 0, 1] } }}
              className={`glass group relative flex aspect-square min-w-[13.5rem] flex-1 snap-center overflow-hidden rounded-3xl border border-white/40 text-ink backdrop-blur-xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl dark:border-white/10 dark:text-white sm:min-w-[15rem] lg:min-w-0 ${isActive ? 'z-10' : ''}`}
              style={cardStyle}
            >
              <Link
                href={`/${commodity.slug}`}
                onMouseEnter={() => router.prefetch(`/${commodity.slug}`)}
                onFocus={() => router.prefetch(`/${commodity.slug}`)}
                aria-label={`Buka dashboard ${commodity.name}`}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex h-full w-full flex-col items-center justify-center p-6 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
              >
                <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-white/5" aria-hidden="true" />
                <span className="relative grid h-24 w-24 place-items-center rounded-full bg-white/75 p-4 shadow-[inset_0_2px_8px_rgba(15,23,42,.12),0_8px_20px_rgba(255,255,255,.25)] transition-transform duration-300 group-hover:scale-105 dark:bg-white/90">
                  <Image src="/logo-akabi-removebg-preview.png" alt="Logo AKABI" width={72} height={72} className="h-full w-full object-contain" />
                </span>
                <span className="relative mt-5 font-sans text-base font-bold leading-tight sm:text-lg">{commodity.name}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
