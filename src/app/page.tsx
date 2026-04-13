"use client";

import { useState } from "react";
import { projects, type Project } from "@/data/projects";
import Gallery from "@/components/Gallery";
import ProjectModal from "@/components/ProjectModal";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["All", "Logos", "Infographics", "Posters", "Branding"] as const;

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<(typeof categories)[number]>("All");

  const handleSelect = (project: Project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  // category counts
  // const categoryCounts = categories.map((c) =>
  //   c === "All" ? projects.length : projects.filter((p) => p.category === c).length
  // );

  return (
    <section className="p-4 md:p-0 md:px-8 pb-28 md:pb-8">
      {/* Hero Intro */}
      <div className="mb-10 mt-8 md:mt-12 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Hi, I'm Julian. <br className="md:hidden" />
          <span className="text-red-900 dark:text-red-500">I design visual identities.</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl">
          I'm a multi-disciplinary designer specializing in branding, logos, and digital experiences that leave a lasting impression.
        </p>
      </div>

      <header className="mb-4 md:mb-8">
        <div className="sticky top-0 pt-4 flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide z-40 bg-gray-50/80 dark:bg-zinc-950/80 backdrop-blur-md">
          {categories.map((c, i) => {
            const activeClass =
              c === active ? "bg-red-900 text-white" : "glass text-red-900 bg-white/50";
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`flex shrink-0 px-4 py-2 rounded-xl ${activeClass} shadow-sm whitespace-nowrap transition-colors`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </header>

      {/* Animated gallery area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <Gallery projects={filtered} onSelect={handleSelect} />
        </motion.div>
      </AnimatePresence>

      {selectedProject && (
        <ProjectModal open={open} project={selectedProject} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}
