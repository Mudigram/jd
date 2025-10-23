import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Julian's Designer Portfolio",
  description: "Creative portfolio showcasing works, experience, and contact info.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen relative pb-20">
        <main className="max-w-4xl mx-auto">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
