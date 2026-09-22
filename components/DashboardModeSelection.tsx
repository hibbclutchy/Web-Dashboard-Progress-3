import Link from 'next/link'
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
    linkClass: 'text-emerald-700',
  },
  {
    title: 'BANPEM (Bantuan Pemerintah)',
    description: 'Lihat data program bantuan pemerintah untuk komoditas ini.',
    label: 'Buka Dashboard',
    href: 'banpem',
    Icon: HandCoins,
    iconClass: 'bg-sky-100 text-sky-700',
    linkClass: 'text-sky-700',
  },
]

export default function DashboardModeSelection({ commodity, basePath }: DashboardModeSelectionProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy px-5 py-8 text-white sm:px-8">
      <Link
        href="/"
        aria-label="Kembali ke halaman utama AKABI"
        className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white/90 shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20 sm:left-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-akabi-removebg-preview.png" alt="Logo AKABI" className="h-6 w-6 rounded-md bg-white/90 object-contain p-0.5" />
        <span>Kembali</span>
      </Link>

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.28em] text-emerald-200/70">Dashboard AKABI</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Pilih Mode Dashboard {commodity}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/65 sm:text-base">
            Pilih jenis dashboard yang ingin Anda buka untuk melihat informasi komoditas.
          </p>
        </div>

        <div className="mt-10 grid w-full gap-5 md:grid-cols-2">
          {modes.map(({ title, description, label, href, Icon, iconClass, linkClass }) => (
            <Link
              key={href}
              href={`${basePath}/${href}`}
              className="glass group rounded-3xl p-6 text-ink transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:text-white"
            >
              <div className={`grid h-11 w-11 place-items-center rounded-full ${iconClass}`}>
                <Icon size={21} strokeWidth={2.2} />
              </div>
              <h2 className="mt-6 text-xl font-extrabold tracking-tight text-ink dark:text-white">{title}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              <span className={`mt-7 inline-flex items-center gap-2 text-sm font-bold ${linkClass}`}>
                {label} <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

