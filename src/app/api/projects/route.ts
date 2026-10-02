import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/lib/auth";
import type { Project } from "@/data/projects";
import bundledProjects from "@/data/projects.json";

// In-memory cache for fast responses and serverless execution
let inMemoryProjects: Project[] | null = null;

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "projects.json");
const TMP_FILE_PATH = path.join("/tmp", "projects.json");

async function readProjects(): Promise<Project[]> {
  if (inMemoryProjects && inMemoryProjects.length > 0) {
    return inMemoryProjects;
  }

  // 1. Try reading /tmp/projects.json (serverless instance cache)
  try {
    const tmpData = await fs.readFile(TMP_FILE_PATH, "utf-8");
    const parsed = JSON.parse(tmpData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryProjects = parsed;
      return parsed;
    }
  } catch {}

  // 2. Try reading local filesystem (local development)
  try {
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryProjects = parsed;
      return parsed;
    }
  } catch {}

  // 3. Fallback to statically bundled projects (always available on Vercel)
  inMemoryProjects = bundledProjects as Project[];
  return inMemoryProjects;
}

async function writeProjects(projects: Project[]): Promise<void> {
  inMemoryProjects = projects;

  // 1. Try writing to local disk (works in local dev / VPS)
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(projects, null, 2), "utf-8");
    return;
  } catch (err: any) {
    console.warn("Local filesystem write skipped (serverless environment):", err?.message);
  }

  // 2. Write to /tmp (writable on Vercel / AWS Lambda)
  try {
    await fs.writeFile(TMP_FILE_PATH, JSON.stringify(projects, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("Could not write to /tmp:", err?.message);
  }

  // 3. If GITHUB_TOKEN & GITHUB_REPO are configured, commit directly to repo
  const ghToken = process.env.GITHUB_TOKEN;
  const ghRepo = process.env.GITHUB_REPO;
  if (ghToken && ghRepo) {
    try {
      await commitToGitHub(ghRepo, ghToken, projects);
    } catch (ghErr) {
      console.error("GitHub sync error:", ghErr);
    }
  }
}

async function commitToGitHub(repo: string, token: string, projects: Project[]) {
  const filePath = "src/data/projects.json";
  const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  // Get current file sha
  const getRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JulianPortfolioAdmin",
    },
  });

  let sha: string | undefined;
  if (getRes.ok) {
    const fileData = await getRes.json();
    sha = fileData.sha;
  }

  const contentBase64 = Buffer.from(
    JSON.stringify(projects, null, 2),
    "utf-8"
  ).toString("base64");

  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JulianPortfolioAdmin",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Update portfolio works via Admin Console",
      content: contentBase64,
      sha,
    }),
  });
}

// GET: public or admin fetch of projects
export async function GET() {
  try {
    const projects = await readProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(bundledProjects as Project[]);
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
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add project" },
      { status: 500 }
    );
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
  } catch (error: any) {
    console.error("PUT /api/projects error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update project" },
      { status: 500 }
    );
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
  } catch (error: any) {
    console.error("DELETE /api/projects error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
