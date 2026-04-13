import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Julian's Designer Portfolio",
  description: "Creative portfolio showcasing works, experience, and contact info.",
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
