"use client";

import React from "react";

interface GlassButtonProps {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    variant?: "red" | "light" | "dark";
}

export default function GlassButton({
    label,
    onClick,
    href,
    icon,
    variant = "red",
}: GlassButtonProps) {
    const baseStyle =
        "inline-flex items-center justify-center gap-2 mt-4 px-5 py-2 rounded-full text-sm font-medium transition-transform duration-300 hover:scale-105 border backdrop-blur-2xl";

    const variants = {
        red: "text-white bg-[rgba(127,29,29,0.6)] hover:bg-[rgba(127,29,29,0.75)] border-white/20",
        light: "text-gray-800 bg-white/20 hover:bg-white/30 border-white/30",
        dark: "text-white bg-black/30 hover:bg-black/40 border-white/10",
    };

    const content = (
        <span className={`${baseStyle} ${variants[variant]}`}>
            {icon && <span className="text-lg">{icon}</span>}
            {label}
        </span>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
                {content}
            </a>
        );
    }

    return (
        <button onClick={onClick} className="focus:outline-none">
            {content}
        </button>
    );
}
