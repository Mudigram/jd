"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import GlassButton from "@/components/GlassButton";
import { Download } from "lucide-react";


type Skill = {
    name: string;
    logo: string;
};

type ProfileData = {
    name: string;
    tagline: string;
    bio: string;
    experience: string[];
    skills: Skill[];
    resume: string;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/data/profile.json");
            const data = await res.json();
            setProfile(data);
        };
        fetchData();
    }, []);

    if (!profile) {
        return (
            <section className="flex flex-col items-center justify-center h-screen text-gray-400">
                <div className="animate-pulse">Loading profile...</div>
            </section>
        );
    }


    return (
        <section className="min-h-screen pb-24 bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
            <div className="flex flex-col items-center text-center px-4 pt-10">
                {/* Profile Picture */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                    <Image
                        src="/assets/logos/profile.jpg"
                        alt={profile.name}
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-white shadow-md"
                    />
                </motion.div>

                {/* Name + Tagline */}
                <motion.h1 className="text-2xl font-bold mt-4">{profile.name}</motion.h1>
                <motion.p className="text-sm text-gray-500 dark:text-gray-400">{profile.tagline}</motion.p>

                {/* Resume Button */}
                <motion.a
                    href={profile.resume}
                    download
                    className="mt-4 px-5 py-2 bg-red-900 text-white backdrop-blur-3xl dark:bg-gray-100 dark:text-black rounded-full text-sm hover:scale-105 transition-transform"
                >
                    Download Resume
                </motion.a>


            </div>

            {/* Bio */}
            <motion.div
                className="mt-10 max-w-2xl mx-auto px-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <p className="leading-relaxed">{profile.bio}</p>
            </motion.div>

            {/* Experience */}
            <div className="mt-10 px-6 max-w-xl mx-auto">
                <h2 className="text-lg font-semibold mb-4">Experience</h2>
                <ul className="space-y-2">
                    {profile.experience.map((exp, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="rounded-2xl p-4 bg-linear-to-b from-white/20 to-white/10 dark:from-gray-800/30 dark:to-gray-800/10 backdrop-blur-2xl border border-white/20 shadow-lg hover:scale-[1.02] transition-transform"
                        >
                            {exp}
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* Skills Grid */}
            <div className="mt-12 px-6 max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-4 text-center">Tools & Skills</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 justify-items-center">
                    {profile.skills.map((skill, i) => (
                        <motion.div
                            key={i}
                            className="flex flex-col items-center gap-2 "
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Image
                                src={skill.logo}
                                alt={skill.name}
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                            <span className="text-xs">{skill.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer CTA */}
            <div className="mt-16 text-center">
                <p className="text-gray-500 mb-3">Interested in working together?</p>
                <a
                    href="/contact"
                    className="px-5 py-2 bg-red-900 text-white rounded-full text-sm hover:bg-red-700 transition"
                >
                    Let’s Talk
                </a>
            </div>
        </section>
    );
}
