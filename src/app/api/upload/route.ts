import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in to upload files." },
      { status: 401 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer;
    let originalName = "upload.jpg";
    let mimeType = "image/jpeg";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.dataUrl) {
        return NextResponse.json(
          { error: "No image data provided" },
          { status: 400 }
        );
      }
      originalName = body.filename || "upload.jpg";
      const matches = body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(body.dataUrl, "base64");
      }
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      originalName = file.name;
      mimeType = file.type;
      buffer = Buffer.from(await file.arrayBuffer());
    }

    // Validate image mime type
    if (mimeType && !mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Maximum file size: 25MB
    if (buffer.length > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 25MB limit" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Determine extension
    let ext = path.extname(originalName).toLowerCase();
    if (!ext || ext.length < 2) {
      if (mimeType.includes("png")) ext = ".png";
      else if (mimeType.includes("webp")) ext = ".webp";
      else if (mimeType.includes("gif")) ext = ".gif";
      else ext = ".jpg";
    }

    const sanitizedBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);

    const filename = `${sanitizedBase || "work"}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process and save image" },
      { status: 500 }
    );
  }
}
