import { getAllPosts } from "../posts";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Helper function to generate sitemap XML
function generateSiteMap(posts: { slug: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${posts
        .map((post) => {
          return `
            <url>
              <loc>${BASE_URL}/posts/${post.slug}</loc>
              <changefreq>weekly</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join("")}
    </urlset>
  `;
}

// The Next.js route handler for sitemap.xml
export async function GET() {
  const posts = await getAllPosts();
  const sitemap = generateSiteMap(posts);

  // Return the generated sitemap with the correct content type
  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
