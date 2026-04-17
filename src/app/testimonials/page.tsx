"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import testimonialsData from "@/data/testimonials.json";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface Testimonial {
    id: number;
    name: string;
    text: string;
    avatar: string;
    role: string;
    category: string;
}

export default function Testimonials() {
    const [shuffled, setShuffled] = useState<Testimonial[]>([]);
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        setShuffled([...(testimonialsData as Testimonial[])].sort(() => 0.5 - Math.random()));
    }, []);

    // Lazy load on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                setVisibleCount((prev) => Math.min(prev + 6, shuffled.length));
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [shuffled]);

    if (!shuffled.length) return null;

    return (
        <section className="min-h-screen py-16 px-6 relative overflow-hidden bg-gray-50 dark:bg-zinc-950 transition-colors">
            {/* Vibrant Background Blobs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-400/20 dark:bg-red-900/20 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-300/20 dark:bg-orange-800/10 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
            
            <motion.div 
                className="relative z-10 max-w-6xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                <div className="text-center mb-16 md:mb-20">
                    <motion.h2 
                        className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Client Testimonials
                    </motion.h2>
                    <motion.p className="text-gray-500 dark:text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
                        Don't just take my word for it. Here is what some of the incredible brands and visionaries I've partnered with have to say.
                    </motion.p>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {shuffled.slice(0, visibleCount).map((t) => (
                        <motion.div
                            key={t.id}
                            variants={{
                                hidden: { opacity: 0, scale: 0.95, y: 20 },
                                visible: { opacity: 1, scale: 1, y: 0 }
                            }}
                            className="relative break-inside-avoid rounded-3xl p-8 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/50 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(220,38,38,0.12)] hover:-translate-y-1.5 transition-all duration-500 group"
                        >
                            <Quote className="absolute top-6 right-6 h-12 w-12 text-red-900/5 dark:text-red-500/10 rotate-180 transition-transform duration-500 group-hover:scale-110" />
                            <p className="text-gray-800 dark:text-gray-200 text-[15px] mb-8 leading-relaxed relative z-10 font-medium">"{t.text}"</p>
                            
                            <div className="flex justify-between items-end mt-auto">
                                <div className="flex items-center space-x-4">
                                    <Image
                                        src={t.avatar}
                                        alt={t.name}
                                        width={52}
                                        height={52}
                                        className="rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
                                    />
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-zinc-50">{t.name}</h3>
                                        <p className="text-xs font-semibold text-red-900 dark:text-red-500 mt-0.5">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/60">
                                <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-400 rounded-full border border-red-100 dark:border-red-900/20">
                                    {t.category}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
