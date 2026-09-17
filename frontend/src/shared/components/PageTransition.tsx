import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { pageReveal } from '@/shared/utils/animations'

export function PageTransition({ children }: { children: ReactNode }) {
  return <motion.div variants={pageReveal} initial="hidden" animate="visible">{children}</motion.div>
}
