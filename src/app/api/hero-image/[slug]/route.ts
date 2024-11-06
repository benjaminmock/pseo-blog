import fs from "fs";
import path from "path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { getPostBySlug } from "@/app/posts";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  const title = decodeURIComponent(post?.title || "");
  const heroImagePath = path.join(
    process.cwd(),
    "public/hero-images",
    `${slug}.jpg`
  );

  // Check if image already exists
  if (fs.existsSync(heroImagePath)) {
    const imageBuffer = fs.readFileSync(heroImagePath);
    return new NextResponse(imageBuffer, {
      headers: { "Content-Type": "image/jpeg" },
    });
  }

  // Split the title into multiple lines
  const maxLineLength = 20; // Adjust this number to control line length
  const lines = [];
  let currentLine = "";

  title.split(" ").forEach((word) => {
    if ((currentLine + word).length <= maxLineLength) {
      currentLine += word + " ";
    } else {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    }
  });
  lines.push(currentLine.trim());

  // Generate image with Sharp if it doesn't exist
  const width = 600;
  const height = 300;
  const image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 220, g: 220, b: 220 },
    },
  });

  // Build the SVG with multi-line text
  const lineHeight = 30;
  // const publishDate = new Date(post?.date || Date.now()).toLocaleDateString(
  //   "en-US",
  //   {
  //     month: "long",
  //     day: "numeric",
  //     year: "numeric",
  //   }
  // );

  // const subtitle = "Find expert tips and local recommendations"; // Adjust as needed
  // const callToAction = "Discover the best insights now!";

  const svgText = `
    <svg width="${width}" height="${height}">
      <style>
        .title { font-family: Arial, sans-serif; fill: #333; font-size: 24px; font-weight: bold; }
        .subtitle { font-family: Arial, sans-serif; fill: #666; font-size: 28px; font-weight: normal; }
        .date { font-family: Arial, sans-serif; fill: #999; font-size: 24px; font-weight: lighter; }
        .cta { font-family: Arial, sans-serif; fill: #333; font-size: 30px; font-weight: bold; }
      </style>
      
      <!-- Title -->
      ${lines
        .map(
          (line, index) => `
          <text x="50%" y="${
            height / 2 - (lines.length / 2) * lineHeight + index * lineHeight
          }" text-anchor="middle" class="title">${line}</text>
        `
        )
        .join("\n")}
  
      
    </svg>
  `;
  //   <!-- Subtitle -->
  //       <text x="50%" y="${
  //         height / 2 + lines.length * lineHeight
  //       }" text-anchor="middle" class="subtitle">${subtitle}</text>

  //       <!-- Publish Date -->
  //       <text x="10%" y="${
  //         height - 40
  //       }" text-anchor="start" class="date">${publishDate}</text>

  //       <!-- CTA -->
  //       <text x="50%" y="${
  //         height - 20
  //       }" text-anchor="middle" class="cta">${callToAction}</text>
  const svgBuffer = Buffer.from(svgText);

  // Compose the SVG text onto the base image and save it
  const imageBuffer = await image
    .composite([{ input: svgBuffer, top: 0, left: 0 }])
    .jpeg()
    .toBuffer();

  // Save the generated image for future use
  fs.mkdirSync(path.dirname(heroImagePath), { recursive: true });
  fs.writeFileSync(heroImagePath, imageBuffer);

  // Return the generated image
  return new NextResponse(imageBuffer, {
    headers: { "Content-Type": "image/jpeg" },
  });
}
