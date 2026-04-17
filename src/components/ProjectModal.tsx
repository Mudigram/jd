"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Project } from "@/data/projects";

interface Props {
    open: boolean;
    project: Project | null;
    onClose: () => void;
}

export default function ProjectModal({ open, project, onClose }: Props) {
    if (!open || !project) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white dark:bg-zinc-950 p-4 rounded-2xl w-full max-w-xl mx-4 max-h-[85vh] overflow-y-auto scrollbar-hide shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div className="flex flex-col gap-3">
                        <Image
                            src={project.image}
                            alt={project.title}
                            width={800}
                            height={800}
                            className="rounded-xl w-full bg-gray-100 dark:bg-zinc-800"
                            priority
                        />
                        {project.additionalImages?.map((img, i) => (
                            <Image
                                key={i}
                                src={img}
                                alt={`${project.title} details - ${i + 1}`}
                                width={800}
                                height={800}
                                className="rounded-xl w-full bg-gray-100 dark:bg-zinc-800"
                                loading="lazy"
                            />
                        ))}
                    </div>
                    
                    <div className="mt-5 pb-2">
                        <h2 className="font-semibold text-2xl text-gray-900 dark:text-zinc-50">{project.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {project.tools.map((tool) => (
                            <span
                                key={tool}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                            >
                                {tool}
                            </span>
                        ))}
                    </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
