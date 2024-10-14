const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export function GET() {
  return new Response(
    `User-agent: *
     Allow: /

     Sitemap: ${BASE_URL}/sitemap.xml
    `,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}
