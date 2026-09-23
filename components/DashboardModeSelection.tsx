import Link from 'next/link'
import type { CSSProperties } from 'react'
import FoldedRibbon from './FoldedRibbon'
import { Activity, HandCoins } from 'lucide-react'

type DashboardModeSelectionProps = {
  commodity: string
  basePath: string
}

const modes = [
  {
    title: 'Monitoring Produktivitas',
    description: 'Lihat data monitoring produktivitas komoditas ini.',
    label: 'Buka Dashboard',
    href: 'monitoring',
    Icon: Activity,
    iconClass: 'bg-emerald-100 text-emerald-700',
    linkClass: 'text-emerald-700 dark:text-emerald-300',
    ribbonColor: '#059669',
  },
  {
    title: 'BANPEM (Bantuan Pemerintah)',
    description: 'Lihat data program bantuan pemerintah untuk komoditas ini.',
    label: 'Buka Dashboard',
    href: 'banpem',
    Icon: HandCoins,
    iconClass: 'bg-sky-100 text-sky-700',
    linkClass: 'text-sky-700 dark:text-sky-300',
    ribbonColor: '#0284c7',
  },
]

export default function DashboardModeSelection({ commodity, basePath }: DashboardModeSelectionProps) {
  const transitionName = `commodity-card-${basePath.replace(/^\//, '')}`

  return (
    <main className="route-fade-in min-h-screen bg-canvas px-5 py-8 text-ink transition-colors duration-500 dark:bg-navy dark:text-white sm:px-8">
      <Link
        href="/"
        aria-label="Kembali ke halaman utama AKABI"
        className="glass fixed left-5 top-5 z-10 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-ink/80 backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-soft dark:bg-white/5 dark:text-white/90 sm:left-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-akabi-removebg-preview.png" alt="Logo AKABI" className="h-6 w-6 rounded-md bg-white object-contain p-0.5" />
        <span>Kembali</span>
      </Link>

      <section
        className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center py-20"
        style={{ viewTransitionName: transitionName } as CSSProperties}
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.28em] text-ink/55 dark:text-emerald-200/70">Dashboard AKABI</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl">
            Pilih Mode Dashboard {commodity}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink/60 dark:text-white/65 sm:text-base">
            Pilih jenis dashboard yang ingin Anda buka untuk melihat informasi komoditas.
          </p>
        </div>

        <div className="mt-12 grid w-full gap-6 md:grid-cols-2">
          {modes.map(({ title, description, label, href, Icon, iconClass, linkClass, ribbonColor }) => (
            <Link
              key={href}
              href={`${basePath}/${href}`}
              className="glass group rounded-[2rem] bg-white/10 p-7 text-ink shadow-soft backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-white/5 dark:text-white"
            >
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${iconClass}`}>
                <Icon size={21} strokeWidth={2.2} />
              </div>
              <h2 className="mt-7 text-xl font-extrabold tracking-tight text-ink dark:text-white"><FoldedRibbon color={ribbonColor}>{title}</FoldedRibbon></h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-ink/60 dark:text-slate-300">{description}</p>
              <span className={`mt-8 inline-flex items-center gap-2 text-sm font-bold ${linkClass}`}>
                {label} <span className="transition-transform duration-300 group-hover:translate-x-1">&#8594;</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}