import Link from 'next/link'

type DashboardComingSoonProps = {
  commodity: string
  mode?: string
  backHref: string
}

export default function DashboardComingSoon({ commodity, mode, backHref }: DashboardComingSoonProps) {
  const title = mode ? `Dashboard ${commodity} - ${mode}` : `Dashboard ${commodity}`

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy p-8 text-center text-white">
      <h1 className="text-2xl font-semibold md:text-4xl">{title}</h1>
      <p className="text-white/70">Dashboard komoditas ini belum tersedia.</p>
      <Link
        href={backHref}
        className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-md transition hover:bg-white/20"
      >
        Kembali
      </Link>
    </main>
  )
}
