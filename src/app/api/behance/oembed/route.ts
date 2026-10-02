import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const behanceUrl = searchParams.get("url");

  if (!behanceUrl) {
    return NextResponse.json({ error: "Missing Behance URL" }, { status: 400 });
  }

  // Basic check for Behance URL
  if (!behanceUrl.includes("behance.net")) {
    return NextResponse.json(
      { error: "Please enter a valid Behance project or profile URL" },
      { status: 400 }
    );
  }

  try {
    const oembedUrl = `https://www.behance.net/services/oembed?url=${encodeURIComponent(
      behanceUrl
    )}`;

    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PortfolioAdmin/1.0)",
      },
    });

    if (!res.ok) {
      // If oEmbed cannot resolve, extract title and id from the URL slug
      const urlParts = behanceUrl.replace(/\/$/, "").split("/");
      const slug = urlParts[urlParts.length - 1];
      const parsedTitle = slug.replace(/^[0-9]+-?/, "").replace(/[-_]/g, " ");

      return NextResponse.json({
        success: true,
        title: parsedTitle || "Behance Project",
        author_name: "Julian",
        behanceUrl,
        note: "Auto-extracted from URL slug (oEmbed restricted)",
      });
    }

    const data = await res.json();

    // Clean up title: Behance oEmbed titles often look like "Title - Author"
    let cleanTitle = data.title || "";
    if (data.author_name && cleanTitle.endsWith(` - ${data.author_name}`)) {
      cleanTitle = cleanTitle.replace(` - ${data.author_name}`, "").trim();
    }

    return NextResponse.json({
      success: true,
      title: cleanTitle,
      author_name: data.author_name,
      author_url: data.author_url,
      html: data.html,
      thumbnail_url: data.thumbnail_url,
      behanceUrl,
    });
  } catch (error) {
    console.error("Behance oEmbed fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Behance project data" },
      { status: 500 }
    );
  }
}
