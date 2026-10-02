import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/lib/auth";
import type { Project } from "@/data/projects";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "projects.json");

async function readProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read projects.json, falling back:", error);
    return [];
  }
}

async function writeProjects(projects: Project[]): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(projects, null, 2), "utf-8");
}

// GET: public or admin fetch of projects
export async function GET() {
  try {
    const projects = await readProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

// POST: Add new project or reorder projects
export async function POST(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Check if bulk reorder
    if (body.action === "reorder" && Array.isArray(body.projects)) {
      await writeProjects(body.projects);
      return NextResponse.json({ success: true, projects: body.projects });
    }

    const { title, category, image, additionalImages, description, tools, behanceUrl } = body;

    if (!title || !category || !image) {
      return NextResponse.json(
        { error: "Title, category, and cover image are required" },
        { status: 400 }
      );
    }

    const projects = await readProjects();
    const maxId = projects.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const newProject: Project = {
      id: maxId + 1,
      title: title.trim(),
      category,
      image: image.trim(),
      additionalImages: Array.isArray(additionalImages) ? additionalImages.filter(Boolean) : [],
      description: description ? description.trim() : "",
      tools: Array.isArray(tools) ? tools.filter(Boolean) : [],
      behanceUrl: behanceUrl ? behanceUrl.trim() : undefined,
    };

    // Prepend new project so it appears first in the portfolio
    const updated = [newProject, ...projects];
    await writeProjects(updated);

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to add project" }, { status: 500 });
  }
}

// PUT: Update existing project
export async function PUT(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, category, image, additionalImages, description, tools, behanceUrl } = body;

    if (id === undefined || !title || !category || !image) {
      return NextResponse.json(
        { error: "ID, title, category, and cover image are required" },
        { status: 400 }
      );
    }

    const projects = await readProjects();
    const index = projects.findIndex((p) => p.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updatedProject: Project = {
      ...projects[index],
      title: title.trim(),
      category,
      image: image.trim(),
      additionalImages: Array.isArray(additionalImages) ? additionalImages.filter(Boolean) : [],
      description: description ? description.trim() : "",
      tools: Array.isArray(tools) ? tools.filter(Boolean) : [],
      behanceUrl: behanceUrl ? behanceUrl.trim() : undefined,
    };

    projects[index] = updatedProject;
    await writeProjects(projects);

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("PUT /api/projects error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE: Remove project by ID
export async function DELETE(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const id = Number(idParam);
    const projects = await readProjects();
    const filtered = projects.filter((p) => p.id !== id);

    if (filtered.length === projects.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await writeProjects(filtered);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("DELETE /api/projects error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
