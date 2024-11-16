import { db } from "@/config";
// const remark = require("remark");
// const html = require("remark-html");
import fs from "fs";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { Entry } from "./p/[slug]/[category]/page";

type Topic = {
  title: string;
  slug: string;
  meta_description: string;
};

export async function getAllPosts(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const stmt = db.prepare(
    `SELECT title, slug FROM cities WHERE content IS NOT NULL LIMIT ${
      limit + 1
    } OFFSET ${offset} `
  );
  const posts = stmt.all() as Post[];
  return posts;
}

export async function getAllTopics() {
  const stmt = db.prepare(`SELECT title, slug, meta_description FROM topics `);
  const topics = stmt.all() as Topic[];
  return topics;
}

export type Post = {
  city: string;
  title: string;
  content: string;
  slug: string;
  meta_description: string;
};

// Fetch a single post by slug
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const stmt = db.prepare(
    "SELECT title, content, meta_description, slug, city FROM cities WHERE slug = ?"
  );
  const post = stmt.get(slug) as Post;

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
      city: post.city,
      title: data.title || post.title, // Use front matter title if available
      content: processedContent.toString(),
      meta_description: data.meta_description || post.meta_description, // Use front matter meta description if available
      slug,
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

export type City = { slug: string; title: string; meta_description: string };

export async function getNearbyCitiesBySlug(
  slug: string,
  limit = 5
): Promise<Array<City>> {
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
  const nearbyCities = stmt.all(slug, limit) as City[];

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
  const post = stmt.get(slug) as Post;

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

export async function getEntriesByCitySlug(city_slug: string) {
  const stmt = db.prepare(`
    SELECT id, name, url, description
    FROM entries
    WHERE city_slug = ?
  `);
  const entries = stmt.all(city_slug);
  return entries as Entry[];
}

export type Category = {
  title: string;
  slug: string;
};

export async function getAllCategories(): Promise<Array<Category>> {
  const stmt = db.prepare(`SELECT title, slug FROM categories`);
  const categories = stmt.all() as Category[];
  return categories;
}

export async function getCategoriesForSlug(
  city_slug: string
): Promise<Array<Category>> {
  const stmt = db.prepare(
    `SELECT DISTINCT c.title, c.slug FROM categories c, posts p WHERE p.city_slug = ? AND c.slug = p.category_slug`
  );
  const categories = stmt.all(city_slug) as Category[];
  return categories;
}

export async function getPostBySlugAndCategory(slug: string, category: string) {
  const stmt = db.prepare(
    `SELECT title, content, meta_description 
     FROM posts 
     WHERE city_slug = ? AND category_slug = ?`
  );
  const post = stmt.get(slug, category) as Post;

  if (post) {
    const { content } = matter(post.content);
    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkHtml)
      .process(content);

    return {
      title: post.title,
      content: processedContent.toString(),
      meta_description: post.meta_description,
    };
  }

  return null;
}

export async function getEntriesByCityAndCategorySlug(
  citySlug: string,
  categorySlug: string
): Promise<Entry[]> {
  // Specify the return type as an array of Entry
  const stmt = db.prepare(`
    SELECT id, name, url, description 
    FROM entries 
    WHERE city_slug = ? AND category_slug = ?
  `);
  return stmt.all(citySlug, categorySlug) as Entry[];
}
