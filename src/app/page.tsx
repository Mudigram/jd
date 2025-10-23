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
    <section className="p-4 pb-28">
      <header className="mb-16">
        <div className="fixed top-4 flex gap-2 overflow-x-auto pb-3 mb-20 scrollbar-hide z-50">
          {categories.map((c, i) => {
            const activeClass =
              c === active ? "bg-red-900 backdrop-blur-sm text-white" : "glass text-red-900";
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`flex shrink-0 px-3 py-1.5 rounded-b-xl ${activeClass} shadow-sm whitespace-nowrap`}
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
