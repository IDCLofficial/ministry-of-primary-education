import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";



export const metadata: Metadata = {
  title: "Ministry of Primary and Secondary Education",
  description: "The Ministry of Primary and Secondary Education in Imo State is responsible for overseeing and developing the state's social welfare sector, as well as managing women empowerment programs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
