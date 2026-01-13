import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: "500",
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fundingperps - Real-Time DEX Funding Rates for Perpetual Swaps",
  description: "Track and compare funding rates across multiple decentralized exchanges (DEX) including Hyperliquid, Lighter, Aster, and Extended. Real-time perpetual swap funding rates with historical data.",
  keywords: ["funding rates", "perpetual swaps", "DEX", "Hyperliquid", "Lighter", "Aster", "Extended", "crypto", "derivatives"],
  authors: [{ name: "fundingperps" }],
  openGraph: {
    title: "fundingperps - Real-Time DEX Funding Rates",
    description: "Track and compare funding rates across multiple decentralized exchanges for perpetual swaps",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "fundingperps - Real-Time DEX Funding Rates",
    description: "Track and compare funding rates across multiple decentralized exchanges for perpetual swaps",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
