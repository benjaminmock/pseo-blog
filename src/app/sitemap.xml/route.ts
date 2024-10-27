import { getAllPosts, getAllTopics } from "../posts";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Helper function to generate sitemap XML
function generateSiteMap(posts: { slug: string }[]) {
  console.log("---------->", posts);
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${posts
        .map((post) => {
          return `
            <url>
              <loc>${BASE_URL}/p/${post.slug}</loc>
              <changefreq>weekly</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join("")}
    </urlset>
  `;
}

export async function GET() {
  const posts = await getAllPosts(1, 10000);
  const topics = await getAllTopics();
  const sitemap = generateSiteMap([...topics, ...posts]);

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
