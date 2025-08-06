'use client'

import { motion } from 'framer-motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  delay?: number
  yOffset?: number
  once?: boolean
}

export default function AnimatedSection({
  children,
  delay = 0,
  yOffset = 60,
  once = true,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once, amount: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
