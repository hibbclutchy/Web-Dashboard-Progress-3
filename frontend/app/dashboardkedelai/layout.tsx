import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AKABI Kedelai',
  description: 'Dashboard monitoring pertanian komoditas kedelai',
}

export default function KedelaiLayout({ children }: { children: React.ReactNode }) {
  return children
}
