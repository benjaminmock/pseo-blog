const db = require("./db");
const fs = require("fs");
const matter = require("gray-matter");

const insertPost = db.prepare(`
  INSERT INTO topics (title, content, slug, meta_description) VALUES (?, ?, ?, ?)
`);

// Read Markdown files and insert them
const mdFiles = fs
  .readdirSync("./content")
  .filter((file) => file.endsWith(".md"));

console.log(mdFiles);
mdFiles.forEach((file) => {
  const content = fs.readFileSync(`./content/${file}`, "utf-8");
  const { data, content: mdContent } = matter(content);
  const slug = file.replace(".md", "");
  insertPost.run(data.title, mdContent, slug, data.meta_description);
});

console.log("Markdown content added to the database.");
