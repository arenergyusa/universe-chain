import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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

import { Web3Provider } from "@/components/providers/Web3Provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}

