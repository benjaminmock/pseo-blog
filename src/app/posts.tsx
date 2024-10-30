import db from "../../db";
// const remark = require("remark");
// const html = require("remark-html");
import fs from "fs";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";

export async function getAllPosts(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const stmt = db.prepare(
    `SELECT title, slug FROM cities WHERE content IS NOT NULL LIMIT ${
      limit + 1
    } OFFSET ${offset} `
  );
  const posts = stmt.all();
  return posts;
}

export async function getAllTopics() {
  const stmt = db.prepare(`SELECT title, slug, meta_description FROM topics `);
  const topics = stmt.all();
  return topics;
}

// Define the Post type
// type Post = {
//   title: string;
//   content: string;
// };

// Fetch a single post by slug
export async function getPostBySlug(
  slug: string
): Promise<
  { title: string; content: string; meta_description: string } | undefined
> {
  const stmt = db.prepare(
    "SELECT title, content, meta_description FROM cities WHERE slug = ?"
  );
  const post = stmt.get(slug);

  if (post) {
    // Use gray-matter to parse the front matter from the post content
    const { data, content } = matter(post.content);

    // Process the markdown content (without front matter) into HTML
    const processedContent = await unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // Add GitHub Flavored Markdown support (including tables)
      .use(remarkHtml) // Convert markdown to HTML
      .process(content);

    // Return the title, processed HTML content, and meta description
    return {
      title: data.title || post.title, // Use front matter title if available
      content: processedContent.toString(),
      meta_description: data.meta_description || post.meta_description, // Use front matter meta description if available
    };
    // const processedContent = await unified()
    //   .use(remarkParse)
    //   .use(remarkHtml)
    //   .process(post.content);

    // post.content = processedContent.toString();
    // return post;
  }

  return undefined;
}

export async function getNearbyCitiesBySlug(
  slug: string,
  limit = 5
): Promise<Array<{ slug: string; title: string; meta_description: string }>> {
  // Prepare the SQL query to find nearby cities where content is not null and order by distance
  const stmt = db.prepare(
    `SELECT c.slug, c.title, c.meta_description 
     FROM cities c
     JOIN nearby_city_distances ncd ON c.id = ncd.nearby_city_id
     JOIN cities original_city ON original_city.id = ncd.city_id
     WHERE original_city.slug = ? 
       AND c.content IS NOT NULL
     ORDER BY ncd.distance ASC
     LIMIT ?`
  );

  // Execute the query with the provided slug and limit
  const nearbyCities = stmt.all(slug, limit);

  return nearbyCities;
}

export async function getMarkdownContent(filePath: string): Promise<string> {
  // Read the markdown file from the file system
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to extract front matter and content
  const { content } = matter(fileContent);

  // Process the markdown content into HTML
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content);

  // Return the processed HTML string
  return processedContent.toString();
}

export async function getTopicBySlug(
  slug: string
): Promise<
  { title: string; content: string; meta_description: string } | undefined
> {
  const stmt = db.prepare(
    "SELECT title, content, meta_description FROM topics WHERE slug = ?"
  );
  const post = stmt.get(slug);

  if (post) {
    // Use gray-matter to parse the front matter from the post content
    const { data, content } = matter(post.content);

    // Process the markdown content (without front matter) into HTML
    const processedContent = await unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // Add GitHub Flavored Markdown support (including tables)
      .use(remarkHtml) // Convert markdown to HTML
      .process(content);

    // Return the title, processed HTML content, and meta description
    return {
      title: data.title || post.title, // Use front matter title if available
      content: processedContent.toString(),
      meta_description: data.meta_description || post.meta_description, // Use front matter meta description if available
    };
    // const processedContent = await unified()
    //   .use(remarkParse)
    //   .use(remarkHtml)
    //   .process(post.content);

    // post.content = processedContent.toString();
    // return post;
  }

  return undefined;
}

export async function getEntriesByCitySlug(city_slug) {
  const stmt = db.prepare(`
    SELECT id, name, url, description
    FROM entries
    WHERE city_slug = ?
  `);
  const entries = stmt.all(city_slug);
  return entries;
}
