'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  offset?: number; // renamed from yOffset to be axis-neutral
  once?: boolean;
}

export default function AnimatedSection({
  children,
  delay = 0,
  offset = 60,
  once = true,
}: AnimatedSectionProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen width on mount
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768); // Tailwind's `md`

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const initialAnim = isMobile
    ? { opacity: 0, y: offset }  
    : { opacity: 0, x: offset }; 

  const finalAnim = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      initial={initialAnim}
      whileInView={finalAnim}
      transition={{ duration: 0.8, delay }}
      viewport={{ once, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
