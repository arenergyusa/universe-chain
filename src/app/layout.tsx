import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono", // Keeping the variable name to avoid refactoring everything if it's used elsewhere, but changing the font itself
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Universe Chain | Secure Web3 Multilevel Marketing",
  description: "Join Universe Chain to earn crypto rewards through our binary MLM system. Connect your wallet, unlock slots, and build your downline.",
  keywords: ["Crypto", "MLM", "Web3", "Binance Smart Chain", "Passive Income", "DeFi"],
  openGraph: {
    title: "Universe Chain | Join the Web3 Revolution",
    description: "Start earning daily crypto rewards with Universe Chain's secure binary MLM system.",
    url: "https://universechain.online",
    siteName: "Universe Chain",
    images: [
      {
        url: "https://universechain.online/og-image.png", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "Universe Chain Web3 MLM",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Universe Chain | Web3 MLM Platform",
    description: "Connect your wallet, build your team, and earn crypto rewards.",
    images: ["https://universechain.online/og-image.png"],
  },
};

import { Toaster } from 'sonner';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

