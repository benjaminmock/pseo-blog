import {
  getPostBySlug,
  getNearbyCitiesBySlug,
  getEntriesByCitySlug,
} from "../../posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  AwaitedReactNode,
} from "react";
import { UrlObject } from "url";

type PostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "No post found for this slug",
    };
  }

  return {
    title: post.title,
    description: post.meta_description,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = params;

  const post = await getPostBySlug(slug);
  const nearbyCities = await getNearbyCitiesBySlug(slug, 5);
  const entries = await getEntriesByCitySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto">
      <article className="prose lg:prose-xl mb-8">
        {/* <h1 className="font-bold text-3xl">{post.title}</h1> */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {/* Related Pages Section */}
      {nearbyCities.length > 0 && (
        <section className="related-pages">
          <h2 className="text-2xl font-bold text-black mb-6">
            Verwandte Seiten
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {nearbyCities.map((city) => (
              <div key={city.slug} className="flex items-start space-x-4">
                <div>
                  <Link
                    href={`/${city.slug}`}
                    className="text-l font-bold text-black hover:underline"
                  >
                    {city.title}
                  </Link>
                  <p className="text-gray-500">{city.meta_description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Entries Section for the Current City */}
      {entries.length > 0 && (
        <section className="city-entries mt-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Einträge für {post.title}
          </h2>
          <ul className="divide-y divide-gray-200">
            {entries.map(
              (entry: {
                id: Key;
                url: string;
                name: string;
                description: string;
              }) => (
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
              )
            )}
          </ul>
        </section>
      )}
    </main>
  );
}
