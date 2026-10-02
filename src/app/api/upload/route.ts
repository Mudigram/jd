import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Maximum file size: 25MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 25MB limit" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Sanitize extension and name
    const originalExt = path.extname(file.name) || ".jpg";
    const sanitizedBase = path
      .basename(file.name, originalExt)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const filename = `${sanitizedBase || "upload"}_${Date.now()}${originalExt}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
