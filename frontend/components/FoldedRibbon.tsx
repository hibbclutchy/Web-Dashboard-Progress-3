import type { ReactNode } from 'react'

type FoldedRibbonProps = {
  children: ReactNode
  color: string
  className?: string
}

export default function FoldedRibbon({ children, color, className = '' }: FoldedRibbonProps) {
  return (
    <span className={`relative isolate inline-flex min-w-[min(88%,18rem)] items-center justify-center ${className}`}>
      <span
        aria-hidden="true"
        className="absolute inset-x-[-0.35rem] top-1/2 z-[-1] h-9 -translate-y-[calc(50%-0.25rem)] rounded-xl opacity-25 blur-sm"
        style={{ backgroundColor: color }}
      />
      <span
        aria-hidden="true"
        className="absolute -left-3 top-1/2 z-0 h-9 w-7 -translate-y-1/2 [clip-path:polygon(100%_0,100%_100%,0_78%,45%_50%,0_22%)] [filter:brightness(.72)]"
        style={{ backgroundColor: color }}
      />
      <span
        aria-hidden="true"
        className="absolute -right-3 top-1/2 z-0 h-9 w-7 -translate-y-1/2 [clip-path:polygon(0_0,0_100%,100%_78%,55%_50%,100%_22%)] [filter:brightness(.72)]"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative z-10 w-full rounded-xl border border-white/25 px-5 py-2.5 text-center text-sm font-extrabold tracking-tight text-white shadow-lg"
        style={{ backgroundColor: color }}
      >
        {children}
      </span>
    </span>
  )
}
