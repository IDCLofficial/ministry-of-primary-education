'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function GlobalLoader() {
  const [loading, setLoading] = useState(true);
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const pathname = usePathname();

  // Initial load
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay if needed

    return () => clearTimeout(timeout);
  }, []);

  // Navigation change
  useEffect(() => {
    setIsRouteChanging(true);
    const timeout = setTimeout(() => {
      setIsRouteChanging(false);
    }, 500); // Delay after route change to hide loader

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (loading || isRouteChanging) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-green-400/50">
        <Image
          src="/images/IMSG-Logo.svg"
          alt="Loading..."
          width={100}
          height={100}
          className="animate-spin-slow"
        />
      </div>
    );
  }

  return null;
}
