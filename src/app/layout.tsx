export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GlobalLoader from '@/components/GlobalLoader'
import { ReduxProvider } from '@/store/provider'



export const metadata: Metadata = {
  title: "Ministry of Primary and Secondary Education",
  description: "The Ministry of Primary and Secondary Education in Imo State is transforming early childhood education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <GlobalLoader />
          <Navbar/>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}