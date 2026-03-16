import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Odigos - Understand Your Car Deal Before You Sign",
  description: "Paste a dealer quote and get clarity on what's included, what's missing, and what to ask. Independent analysis for car buyers.",
};

export const viewport: Viewport = {
  themeColor: "#2a7d7d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
