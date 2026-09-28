import DashboardComingSoon from '../../../components/DashboardComingSoon'
import { notFound } from 'next/navigation'

const COMMODITIES: Record<string, string> = {
  dashboardkacanghijau: 'Kacang Hijau',
  dashboardkacangtanah: 'Kacang Tanah',
  dashboardubikayu: 'Ubi Kayu',
  dashboardubijalar: 'Ubi Jalar',
}

const MODES: Record<string, string> = {
  monitoring: 'Monitoring Produktivitas',
  banpem: 'BANPEM (Bantuan Pemerintah)',
}

export default function DashboardModePage({ params }: { params: { slug: string; mode: string } }) {
  const commodity = COMMODITIES[params.slug]
  const mode = MODES[params.mode]
  if (!commodity || !mode) notFound()

  return <DashboardComingSoon commodity={commodity} mode={mode} backHref={`/${params.slug}`} />
}
