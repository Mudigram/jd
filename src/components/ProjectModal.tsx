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
                    className="bg-white p-4 rounded-2xl max-w-md mx-4"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <Image
                        src={project.image}
                        alt={project.title}
                        width={600}
                        height={600}
                        className="rounded-xl"
                    />
                    <h2 className="mt-3 font-semibold text-lg">{project.title}</h2>
                    <p className="text-sm text-gray-600 mt-2">{project.description}</p>
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
