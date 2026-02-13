export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import "../globals.css";


export const metadata: Metadata = {
  title: "MOPSE Admin Dashboard - Ministry of Primary and Secondary Education",
  description: "Administrative dashboard for the Ministry of Primary and Secondary Education in Imo State.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}