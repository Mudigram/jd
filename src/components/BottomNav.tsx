"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, MessageCircle, Star } from "lucide-react";

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/contact", icon: MessageCircle, label: "Contact" },
    { href: "/testimonials", icon: Star, label: "Testimonials" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-4 left-4 right-4 rounded-2xl  glass backdrop-blur-sm border-t shadow-sm z-50">
            <div className="flex justify-around py-2">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center text-sm ${active ? "text-red-900" : "text-gray-500"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
