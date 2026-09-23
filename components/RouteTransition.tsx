'use client'

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()

  return (
    <LayoutGroup id="akabi-routes">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.46, ease: [0.32, 0.72, 0, 1] }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  )
}
