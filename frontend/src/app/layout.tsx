import type { Metadata } from "next";
import "./globals.css";

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
      className="bg-[#0a0e1a] text-slate-100 min-h-screen antialiased"
    >
      <body className="bg-[#0a0e1a] text-slate-100 min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
