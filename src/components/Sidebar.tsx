"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, MessageCircle, Star, Sun, Moon, Instagram, Linkedin, Twitter } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/contact", icon: MessageCircle, label: "Contact" },
    { href: "/testimonials", icon: Star, label: "Testimonials" },
];

const socialItems = [
    { href: "#", icon: Instagram, label: "Instagram" },
    { href: "#", icon: Twitter, label: "Twitter" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 shadow-xl shadow-black/5 z-50 p-6 transition-colors">
            <div className="mb-12 flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Julian's Design</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Creative Portfolio</p>
                </div>
                {/* Dark Mode Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                )}
            </div>

            <nav className="flex flex-col gap-3 flex-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active
                                    ? "bg-red-900 text-white shadow-md shadow-red-900/20"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-zinc-50"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-gray-100 dark:border-zinc-800 pt-6">
                <div className="flex gap-4 justify-start mb-6">
                    {socialItems.map(({ href, icon: Icon, label }) => (
                        <Link
                            key={label}
                            href={href}
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-zinc-50 transition"
                            aria-label={label}
                        >
                            <Icon className="h-5 w-5" />
                        </Link>
                    ))}
                </div>
                <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Julian</p>
            </div>
        </aside>
    );
}
