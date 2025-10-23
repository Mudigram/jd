"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import testimonialsData from "@/data/testimonials.json";

// ✅ Define interface correctly
interface Testimonial {
    id: number;
    name: string;
    text: string;
    avatar: string;
    role: string;
    category: string;
}

export default function Testimonials() {
    const [shuffled, setShuffled] = useState<Testimonial[]>(() =>
        [...(testimonialsData as Testimonial[])].sort(() => 0.5 - Math.random())
    );
    const [visibleCount, setVisibleCount] = useState(6);

    // ✅ Lazy load on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                setVisibleCount((prev) => Math.min(prev + 6, shuffled.length));
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [shuffled]);

    return (
        <section className="min-h-screen py-16 px-6 bg-linear-to-b from-gray-50 to-white">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
                Testimonials
            </h2>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {shuffled.slice(0, visibleCount).map((t) => (
                    <div
                        key={t.id}
                        className="rounded-2xl p-4 bg-linear-to-b from-white/20 to-white/10 dark:from-gray-800/30 dark:to-gray-800/10 backdrop-blur-2xl border border-white/20 shadow-lg hover:shadow-[0_0_25px_rgba(255,0,0,0.2)] hover:scale-[1.03] transition-all duration-300"
                    >
                        <p className="text-gray-700 text-sm mb-4 leading-relaxed">“{t.text}”</p>
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center space-x-3">
                                <Image
                                    src={t.avatar}
                                    alt={t.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-medium text-gray-900">{t.name}</h3>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap">
                                {t.category}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
