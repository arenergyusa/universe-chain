import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universe Chain | Advanced Web3 Ecosystem & Smart Contracts",
  description: "Join Universe Chain to unlock decentralized rewards through our transparent blockchain platform. Connect your wallet, activate slots, and build your community on Universe Chain.",
  keywords: ["Universe Chain", "Crypto", "Web3", "Binance Smart Chain", "Decentralized Ecosystem", "Smart Contracts", "Blockchain Rewards", "DeFi"],
  openGraph: {
    title: "Universe Chain | Join the Universe Chain Revolution",
    description: "Experience transparent blockchain rewards with Universe Chain's secure ecosystem.",
    url: "https://universechain.online",
    siteName: "Universe Chain",
    images: [
      {
        url: "https://universechain.online/og-image.png", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "Universe Chain Web3 Ecosystem",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Universe Chain | Web3 Decentralized Platform",
    description: "Connect your wallet, grow your community, and receive Web3 rewards on Universe Chain.",
    images: ["https://universechain.online/og-image.png"],
  },
};

import { Toaster } from '@/components/ui/sonner';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full", "antialiased", "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

