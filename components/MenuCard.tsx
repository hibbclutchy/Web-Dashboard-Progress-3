'use client'
// PLACEHOLDER: ganti dengan MenuCard asli milik teman.
// Di Next.js, navigasi memakai <Link href> dari 'next/link',
// bukan <Link to> dari react-router-dom.
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

type MenuCardProps = {
  commodity: string
  path: string
  icon: LucideIcon
}

const MenuCard = ({ commodity, path, icon: Icon }: MenuCardProps) => {
  return (
    <Link href={`/${path}`} className="group block h-full">
      <div
        className="flex flex-col justify-center p-4 md:p-8 bg-gradient-to-tr from-green-950 to-green-700 rounded-md shadow-md transition-all duration-300
            hover:-translate-y-1 hover:shadow-2xl text-yellow-500"
      >
        <Icon size={24} className="mb-2 text-yellow-500 transition-transform duration-300 group-hover:scale-110" />
        <h1 className="mb-2 mt-1 text-base font-bold tracking-tight text-white md:text-lg lg:text-xl"> {commodity}</h1>

        <div className="flex items-center justify-between border-t border-white/20 pt-3 text-white">
          <h2 className="text-xs font-semibold text-white transition-colors group-hover:text-white lg:text-sm">Lihat Data</h2>
          <ArrowRight size={16} className="text-white transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

export default MenuCard
