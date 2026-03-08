export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GlobalLoader from '@/components/GlobalLoader'
import { publicMetadata } from "@/lib/metadata";

export const metadata: Metadata = publicMetadata.home

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GlobalLoader />
        <Navbar/>
        {children}
      </body>
    </html>
  );
}