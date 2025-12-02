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
  metadataBase: new URL("https://www.hackathon-data.example"),
  title: {
    default: "Atlas Commerce | Data-driven retail intelligence",
    template: "%s | Atlas Commerce",
  },
  description:
    "Unified commerce homepage showcasing hero promotions, live categories, recommendations, and editorial content.",
  openGraph: {
    title: "Atlas Commerce",
    description:
      "A composable storefront that blends real-time analytics, ML recommendations, and editorial storytelling.",
    url: "https://www.hackathon-data.example",
    siteName: "Atlas Commerce",
    images: [
      {
        url: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Commerce",
    description: "Data-driven ecommerce homepage",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
