import db from "../../db";
// const remark = require("remark");
// const html = require("remark-html");

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";

export async function getAllPosts(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const stmt = db.prepare(
    `SELECT title, slug FROM posts LIMIT ${limit + 1} OFFSET ${offset}`
  );
  const posts = stmt.all();
  return posts;
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
    "SELECT title, content, meta_description FROM posts WHERE slug = ?"
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
