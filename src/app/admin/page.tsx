"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Upload,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  LogOut,
  Search,
  Check,
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  FolderOpen,
  Layers,
  Globe,
  Tag,
} from "lucide-react";
import type { Project } from "@/data/projects";

const defaultCategories = ["Logos", "Infographics", "Posters", "Branding", "Art"];
const commonTools = ["Illustrator", "Photoshop", "Figma", "Canva", "After Effects", "InDesign", "Blender"];

// Helper to safely optimize high-res image files in browser to avoid 413 or timeout errors
async function optimizeImageForUpload(file: File): Promise<{ file: File; dataUrl?: string }> {
  // If not an image or SVG/GIF, return directly
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return { file };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDimension = 2400;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ file, dataUrl: e.target?.result as string });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-res JPEG/PNG for lightweight transfer
        const outputMime = file.type === "image/png" && file.size < 2 * 1024 * 1024 ? "image/png" : "image/jpeg";
        const quality = 0.88;
        const dataUrl = canvas.toDataURL(outputMime, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ file, dataUrl });
              return;
            }
            const outExt = outputMime === "image/png" ? ".png" : ".jpg";
            const newName = file.name.replace(/\.[^.]+$/, "") + outExt;
            const optimizedFile = new File([blob], newName, { type: outputMime, lastModified: Date.now() });
            resolve({ file: optimizedFile, dataUrl });
          },
          outputMime,
          quality
        );
      };
      img.onerror = () => resolve({ file });
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ file });
    reader.readAsDataURL(file);
  });
}

// Upload file to server with automatic fallback to JSON base64
async function uploadImageFile(file: File): Promise<string> {
  const { file: optimized, dataUrl } = await optimizeImageForUpload(file);

  // Attempt 1: Standard FormData upload
  try {
    const formData = new FormData();
    formData.append("file", optimized);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || `HTTP ${res.status}: ${res.statusText}` };
    }

    if (res.ok && data.url) {
      return data.url;
    }

    if (res.status === 401) {
      throw new Error("Session expired. Please log in again.");
    }

    // If FormData had an issue, fallback to dataUrl base64 if available
    if (dataUrl) {
      return await uploadBase64(dataUrl, optimized.name);
    }

    throw new Error(data.error || "Upload failed");
  } catch (err: any) {
    if (dataUrl && !err.message?.includes("Session expired")) {
      return await uploadBase64(dataUrl, optimized.name);
    }
    throw err;
  }
}

async function uploadBase64(dataUrl: string, filename: string): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl, filename }),
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text || `HTTP ${res.status}: ${res.statusText}` };
  }

  if (!res.ok) {
    throw new Error(data.error || "Upload failed via fallback");
  }

  return data.url;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBehanceModalOpen, setIsBehanceModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Logos");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formAdditionalImages, setFormAdditionalImages] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState("");
  const [formTools, setFormTools] = useState<string[]>([]);
  const [customToolInput, setCustomToolInput] = useState("");
  const [formBehanceUrl, setFormBehanceUrl] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  // Behance importer states
  const [behanceInputUrl, setBehanceInputUrl] = useState("");
  const [behanceFetching, setBehanceFetching] = useState(false);
  const [behanceError, setBehanceError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // Verify authentication on mount
  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const authRes = await fetch("/api/admin/me");
      if (!authRes.ok) {
        router.push("/admin/login");
        return;
      }

      await loadProjects();
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormTitle("");
    setFormCategory("Logos");
    setFormCustomCategory("");
    setFormImage("");
    setFormAdditionalImages([]);
    setFormDescription("");
    setFormTools(["Illustrator"]);
    setFormBehanceUrl("");
    setFormError(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormTitle(project.title);
    if (defaultCategories.includes(project.category)) {
      setFormCategory(project.category);
      setFormCustomCategory("");
    } else {
      setFormCategory("Custom");
      setFormCustomCategory(project.category);
    }
    setFormImage(project.image);
    setFormAdditionalImages(project.additionalImages || []);
    setFormDescription(project.description || "");
    setFormTools(project.tools || []);
    setFormBehanceUrl(project.behanceUrl || "");
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    setFormError(null);
    try {
      const uploadedUrl = await uploadImageFile(file);
      setFormImage(uploadedUrl);
    } catch (err: any) {
      console.error("Cover upload error:", err);
      setFormError(err.message || "Failed to upload cover image. Please try again.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAdditionalUpload = async (files: FileList) => {
    setUploadingAdditional(true);
    setFormError(null);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const url = await uploadImageFile(file);
          if (url) uploadedUrls.push(url);
        } catch (fileErr: any) {
          console.error(`Failed to upload ${file.name}:`, fileErr);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormAdditionalImages((prev) => [...prev, ...uploadedUrls]);
      } else {
        setFormError("Could not upload additional images. Please check file sizes or format.");
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to upload additional images");
    } finally {
      setUploadingAdditional(false);
    }
  };

  const toggleTool = (tool: string) => {
    if (formTools.includes(tool)) {
      setFormTools(formTools.filter((t) => t !== tool));
    } else {
      setFormTools([...formTools, tool]);
    }
  };

  const addCustomTool = () => {
    const trimmed = customToolInput.trim();
    if (trimmed && !formTools.includes(trimmed)) {
      setFormTools([...formTools, trimmed]);
      setCustomToolInput("");
    }
  };

  const removeAdditionalImage = (index: number) => {
    setFormAdditionalImages(formAdditionalImages.filter((_, i) => i !== index));
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const category = formCategory === "Custom" ? formCustomCategory.trim() : formCategory;

    if (!formTitle.trim()) {
      setFormError("Project title is required");
      return;
    }
    if (!category) {
      setFormError("Project category is required");
      return;
    }
    if (!formImage.trim()) {
      setFormError("Please upload or provide a cover image");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        id: editingProject ? editingProject.id : undefined,
        title: formTitle.trim(),
        category,
        image: formImage.trim(),
        additionalImages: formAdditionalImages,
        description: formDescription.trim(),
        tools: formTools,
        behanceUrl: formBehanceUrl.trim() || undefined,
      };

      const res = await fetch("/api/projects", {
        method: editingProject ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || `HTTP ${res.status}` };
      }

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(data.error || "Failed to save project");
      }

      await loadProjects();
      setIsEditorOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save project");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
      } else {
        alert(data.error || "Failed to delete project");
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const moveProject = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setProjects(updated);

    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", projects: updated }),
      });
    } catch (err) {
      console.error("Failed to persist reorder", err);
    }
  };

  const handleBehanceFetch = async () => {
    if (!behanceInputUrl.trim()) return;
    setBehanceFetching(true);
    setBehanceError(null);

    try {
      const res = await fetch(
        `/api/behance/oembed?url=${encodeURIComponent(behanceInputUrl.trim())}`
      );
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || `HTTP ${res.status}` };
      }

      if (!res.ok) {
        throw new Error(data.error || "Could not fetch Behance details");
      }

      // Close Behance modal and populate Editor modal
      setIsBehanceModalOpen(false);
      setEditingProject(null);
      setFormTitle(data.title || "New Behance Project");
      setFormCategory("Branding");
      setFormCustomCategory("");
      setFormImage(data.thumbnail_url || "");
      setFormAdditionalImages([]);
      setFormDescription(
        `Visual identity project showcased on Behance by ${data.author_name || "Julian"}.`
      );
      setFormTools(["Photoshop", "Illustrator"]);
      setFormBehanceUrl(data.behanceUrl || behanceInputUrl.trim());
      setIsEditorOpen(true);
    } catch (err: any) {
      setBehanceError(err.message || "Failed to resolve Behance project");
    } finally {
      setBehanceFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-900 dark:text-red-500" />
      </div>
    );
  }

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tools.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  return (
    <div className="p-4 md:p-0 md:px-8 pb-32 md:pb-12 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="mt-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-900/10 text-red-900 dark:bg-red-950 dark:text-red-400">
              Admin Console
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">• Julian's Portfolio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mt-1">
            Works & Gallery Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Upload new designs, import from Behance, or edit existing projects in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition"
          >
            <Globe className="w-3.5 h-3.5" /> View Live Site
          </Link>
          <button
            onClick={() => {
              setBehanceInputUrl("");
              setBehanceError(null);
              setIsBehanceModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium inline-flex items-center gap-1.5 transition border border-blue-200/50 dark:border-blue-900 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Import Behance
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-sm shadow-red-900/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Work
          </button>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Works</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mt-1">{projects.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Branding & Logos</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mt-1">
            {projects.filter((p) => p.category === "Logos" || p.category === "Branding").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Posters & Graphics</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mt-1">
            {projects.filter((p) => p.category === "Posters" || p.category === "Infographics").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Behance Linked</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mt-1">
            {projects.filter((p) => Boolean(p.behanceUrl)).length}
          </p>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title or tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 dark:focus:ring-red-500 text-gray-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat
                  ? "bg-red-900 text-white font-medium"
                  : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table / Cards List */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <FolderOpen className="w-10 h-10 mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
            <p className="font-medium text-base">No works found</p>
            <p className="text-xs mt-1">Try adjusting your search or add a new project above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition"
              >
                {/* Project Info */}
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-700/50">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized={project.image.startsWith("http")}
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-zinc-50">
                        {project.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                        {project.category}
                      </span>
                      {project.behanceUrl && (
                        <a
                          href={project.behanceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Behance
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xl">
                      {project.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tools.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-zinc-700/50"
                        >
                          {t}
                        </span>
                      ))}
                      {project.additionalImages && project.additionalImages.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">
                          +{project.additionalImages.length} additional images
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    disabled={index === 0}
                    onClick={() => moveProject(index, "up")}
                    className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === projects.length - 1}
                    onClick={() => moveProject(index, "down")}
                    className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    title="Edit Work"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  {deleteConfirmId === project.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-500 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                      title="Delete Work"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT PROJECT MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">
                  {editingProject ? "Edit Project" : "Add New Work"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingProject
                    ? `Updating "${editingProject.title}"`
                    : "Fill in the details to publish to your portfolio"}
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-5">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Visual Identity"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 dark:focus:ring-red-500 text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 dark:focus:ring-red-500 text-gray-900 dark:text-zinc-100"
                  >
                    {defaultCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category...</option>
                  </select>
                </div>
              </div>

              {formCategory === "Custom" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Custom Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3D Renders or Typography"
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 dark:focus:ring-red-500 text-gray-900 dark:text-zinc-100"
                  />
                </div>
              )}

              {/* Cover Image Upload & URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Cover Image * (Upload file or enter URL)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Upload Box */}
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="sm:col-span-2 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-red-900 dark:hover:border-red-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50/50 dark:bg-zinc-800/40 transition group"
                  >
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleCoverUpload(e.target.files[0]);
                        }
                      }}
                    />
                    {uploadingCover ? (
                      <div className="flex items-center gap-2 text-xs text-red-900 dark:text-red-400 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin" /> Uploading cover image...
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-red-900 dark:group-hover:text-red-400 mb-1.5 transition" />
                        <span className="text-xs font-medium text-gray-700 dark:text-zinc-200">
                          Click to upload cover image
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP up to 25MB</span>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 min-h-[90px] flex items-center justify-center">
                    {formImage ? (
                      <Image
                        src={formImage}
                        alt="Preview"
                        fill
                        sizes="180px"
                        className="object-cover"
                        unoptimized={formImage.startsWith("http")}
                      />
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="w-6 h-6 text-gray-300 dark:text-zinc-600 mx-auto" />
                        <span className="text-[10px] text-gray-400">No cover yet</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct URL input fallback */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Or paste image URL / asset path (/assets/...)"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300"
                  />
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Additional Gallery Images (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => additionalInputRef.current?.click()}
                    className="text-xs text-red-900 dark:text-red-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload More
                  </button>
                </div>

                <input
                  ref={additionalInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleAdditionalUpload(e.target.files);
                    }
                  }}
                />

                {uploadingAdditional && (
                  <div className="p-3 mb-2 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Loader2 className="w-4 h-4 animate-spin text-red-900" /> Uploading additional images...
                  </div>
                )}

                {/* Previews of additional images */}
                {formAdditionalImages.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                    {formAdditionalImages.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Additional ${i}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized={imgUrl.startsWith("http")}
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(i)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No additional images added yet.</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell the story or context behind this visual design..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 dark:focus:ring-red-500 text-gray-900 dark:text-zinc-100 resize-none"
                />
              </div>

              {/* Tools Used */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Tools Used
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {commonTools.map((tool) => {
                    const selected = formTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleTool(tool)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          selected
                            ? "bg-red-900 text-white"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {tool}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tool Input */}
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    placeholder="Add custom tool (e.g. Cinema 4D)"
                    value={customToolInput}
                    onChange={(e) => setCustomToolInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTool();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={addCustomTool}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-zinc-200 text-xs font-medium rounded-lg transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Behance Link */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Behance Project Link (Optional)
                </label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://www.behance.net/gallery/123456789/Project-Name"
                    value={formBehanceUrl}
                    onChange={(e) => setFormBehanceUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 dark:focus:ring-red-500 text-gray-900 dark:text-zinc-100 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingCover || uploadingAdditional}
                  className="px-6 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-white text-sm font-medium shadow-md shadow-red-900/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save & Publish Work"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BEHANCE IMPORT MODAL */}
      {isBehanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">Import from Behance</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Paste your Behance case study URL</p>
                </div>
              </div>
              <button
                onClick={() => setIsBehanceModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {behanceError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
                {behanceError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Behance Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.behance.net/gallery/123456789/Project-Name"
                  value={behanceInputUrl}
                  onChange={(e) => setBehanceInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBehanceFetch()}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 dark:text-zinc-100"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  We'll automatically extract the project title, author info, and link it directly to your portfolio.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBehanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={behanceFetching || !behanceInputUrl.trim()}
                  onClick={handleBehanceFetch}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {behanceFetching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving Project...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Fetch & Open Editor
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
