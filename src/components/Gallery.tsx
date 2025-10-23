"use client";

import { useState } from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { motion } from "framer-motion";

interface Props {
    projects: Project[];
    onSelect: (project: Project) => void;
}

export default function Gallery({ projects, onSelect }: Props) {
    const [loadedCount, setLoadedCount] = useState(0);

    // detect when all images are loaded
    const allLoaded = loadedCount >= projects.length && projects.length > 0;

    //   useEffect(() => {
    //     setLoadedCount(0);
    //   }, [projects]);

    return (
        <div className="relative min-h-[200px]">
            {/* Global skeleton while grid loading */}
            {!allLoaded && (
                <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 rounded-2xl" />
                    ))}
                </div>
            )}

            <div className={`columns-2 md:columns-3 gap-4 transition-opacity duration-300 ${allLoaded ? "opacity-100" : "opacity-0"}`}>
                {projects.map((project) => (
                    <GalleryItem key={project.id} project={project} onSelect={onSelect} onLoad={() => setLoadedCount((n) => n + 1)} />
                ))}
            </div>
        </div>
    );
}

function GalleryItem({
    project,
    onSelect,
    onLoad,
}: {
    project: Project;
    onSelect: (p: Project) => void;
    onLoad: () => void;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className="mb-4 break-inside-avoid cursor-pointer relative"
            onClick={() => onSelect(project)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(project)}
        >
            <motion.div
                className="relative w-full overflow-hidden rounded-2xl bg-gray-100"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Individual skeleton */}
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2/3 h-24 sm:h-36 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                )}

                <Image
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={800}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className={`rounded-2xl transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => {
                        setLoaded(true);
                        onLoad();
                    }}
                    loading="lazy"
                />
            </motion.div>

            {/* Category Badge */}
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                {project.category}
            </span>

            <p className="mt-2 text-sm text-gray-700 line-clamp-2">{project.title}</p>
        </div>
    );
}
