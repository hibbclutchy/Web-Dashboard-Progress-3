import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '../components/ThemeProvider'
import RouteTransition from '../components/RouteTransition'

export const metadata: Metadata = { title: 'AKABI', description: 'Dashboard monitoring pertanian komoditas pangan' }

const themeScript = `(() => { try { const stored = localStorage.getItem('akabi-theme'); const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches; if (stored === 'dark' || (!stored && systemDark)) document.documentElement.classList.add('dark'); } catch (_) {} })()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><ThemeProvider><RouteTransition>{children}</RouteTransition></ThemeProvider></body>
    </html>
  )
}
