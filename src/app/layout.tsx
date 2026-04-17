import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Julian | Multi-Disciplinary Designer",
    template: "%s | Julian's Portfolio",
  },
  description: "A highly curated portfolio showcasing brand identities, logos, infographics, and vibrant illustrations.",
  keywords: ["Graphic Designer", "Visual Identity", "Branding", "UI/UX", "Logos", "Poster Design", "Freelance Designer"],
  authors: [{ name: "Julian", url: "https://julianportfolio.com" }],
  creator: "Julian",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://julianportfolio.com",
    siteName: "Julian's Design Portfolio",
    title: "Julian | Multi-Disciplinary Designer",
    description: "Explore my creative journey through branding, typography, and visual identities.",
    images: [
      {
        url: "/assets/branding/Sendora/Sendora visual identity.jpg",
        width: 1200,
        height: 630,
        alt: "Julian's Design Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Julian | Multi-Disciplinary Designer",
    description: "Explore my creative journey through branding, typography, and visual identities.",
    creator: "@juliansdesign",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 min-h-screen relative pb-20 md:pb-0 md:pl-64 flex flex-col transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Sidebar />
          <main className="max-w-5xl mx-auto w-full flex-1 md:py-8">{children}</main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
