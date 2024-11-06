import {
  getPostBySlugAndCategory,
  getEntriesByCityAndCategorySlug,
} from "@/app/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Key } from "react";

type PostPageProps = {
  params: {
    slug: string;
    category: string;
  };
};

// Define the type for an entry
export type Entry = {
  id: Key;
  url: string;
  name: string;
  description: string;
};

export default async function CategoryPage({ params }: PostPageProps) {
  const { slug, category } = params;

  // Fetch post by slug and category
  const post = await getPostBySlugAndCategory(slug, category);
  const entries: Entry[] = await getEntriesByCityAndCategorySlug(
    slug,
    category
  );

  if (!post) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:underline">
              home
            </Link>
          </li>
          <li className="mx-1">/</li>
          <li>
            <Link href={`/p/${slug}`} className="hover:underline">
              {slug}
            </Link>
          </li>
          <li className="mx-1">/</li>
          <li className="text-gray-800 font-semibold">{category}</li>
        </ol>
      </nav>

      <article className="prose lg:prose-xl mb-8">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {/* Entries Section for the Specified Category */}
      {entries.length > 0 && (
        <section className="category-entries mt-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Einträge für {post.title} in Kategorie: {category}
          </h2>
          <ul className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="py-4 px-4 flex flex-col space-y-2 transition-all duration-200 hover:bg-gray-100 hover:shadow-md rounded-lg"
              >
                <Link href={entry.url} className="space-y-1">
                  <p className="text-lg font-semibold text-blue-600 hover:underline">
                    {entry.name}
                  </p>
                  <p className="text-gray-500 text-sm">{entry.url}</p>
                </Link>
                <p className="text-gray-600 text-sm">{entry.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
