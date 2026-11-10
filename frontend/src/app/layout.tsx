import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cold Chain AI - Enterprise Command Center",
  description: "Real-time temperature-sensitive cargo tracking, blockchain audits, and machine learning risk analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} bg-[#0a0e1a] text-slate-100 min-h-screen antialiased`}
    >
      <body className="bg-[#0a0e1a] text-slate-100 min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
