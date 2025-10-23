"use client";

import Image from "next/image";
import socials from "@/data/socials.json";

export default function ContactPage() {
    return (
        <section className="min-h-screen bg-white p-6 pb-24 flex flex-col items-center mt-10">
            <div className="max-w-md w-full text-center">
                <h1 className="text-2xl font-semibold mb-2">Let’s Connect ✉️</h1>
                <p className="text-gray-500 mb-8">
                    Got a project or collaboration idea? Drop a message below.
                </p>

                {/* Contact Form */}
                <form className="space-y-4">
                    <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                    />
                    <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                    />
                    <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition resize-none"
                    />
                    <button
                        type="button"
                        className="w-full bg-red-900 text-white font-medium py-3 rounded-xl shadow-md hover:opacity-90 transition"
                    >
                        Send Message
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-8">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="px-3 text-gray-400 text-sm">or find me on</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Social Icons */}
                <div className="flex justify-center flex-wrap gap-6">
                    {socials.map((social) => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 shadow-sm transition transform hover:-translate-y-1"
                        >
                            <Image
                                src={social.icon}
                                alt={social.name}
                                width={28}
                                height={28}
                                className="rounded-full object-contain"
                            />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
