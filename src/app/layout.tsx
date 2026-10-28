export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GlobalLoader from '@/components/GlobalLoader'
import { publicMetadata } from "@/lib/metadata";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = publicMetadata.home

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <script
          src="https://pulse-track.onrender.com/tracker.min.js"
          data-key="pk_live_ace0994b812ee316a5649585"
          defer
        />
      </head>
      <body>
        <GlobalLoader />
        <Navbar/>
        {children}

        <Script
          src="https://cloud.umami.is/script.js" 
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
