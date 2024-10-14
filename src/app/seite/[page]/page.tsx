import { metadata } from "@/config";
import { getAllPosts } from "../../posts";
import Link from "next/link";

// Define the Post type
type Post = {
  title: string;
  slug: string;
};

const POSTS_PER_PAGE = 10;

export default async function PaginatedPage({
  params,
}: {
  params: { page: string };
}) {
  const pageNumber = parseInt(params.page, 10) || 1;
  const posts: Post[] = await getAllPosts(pageNumber, POSTS_PER_PAGE);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">{metadata.indexPageH1}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug} className="mb-4">
            <Link
              href={`/p/${post.slug}`}
              className="text-blue-500 hover:underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex justify-between mt-4">
        {pageNumber > 1 && (
          <Link
            href={`/seite/${pageNumber - 1}`}
            className="px-4 py-2 text-blue-500"
          >
            Vorherige
          </Link>
        )}
        {posts.length > POSTS_PER_PAGE && (
          <Link
            href={`/seite/${pageNumber + 1}`}
            className="px-4 py-2 text-blue-500"
          >
            Nächste
          </Link>
        )}
      </div>
    </div>
  );
}
