import { metadata, faqs, ACTIVE_CONFIGURATION } from "@/config";
import { getAllPosts, getMarkdownContent, getAllTopics } from "../../posts";
import Link from "next/link";

// type Post = {
//   title: string;
//   slug: string;
// };

// type Topic = {
//   title: string;
//   slug: string;
//   meta_description: string;
// };

const POSTS_PER_PAGE = 10;

export default async function PaginatedPage({
  params,
}: {
  params: { page: string };
}) {
  const pageNumber = parseInt(params.page, 10) || 1;
  const posts = await getAllPosts(pageNumber, POSTS_PER_PAGE);
  const topics = await getAllTopics();
  const content = await getMarkdownContent(
    `./src/config/${ACTIVE_CONFIGURATION}/index.md`
  );

  return (
    <div className="max-w-3xl mx-auto">
      <article className="prose lg:prose-xl mb-8">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>

      {topics.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">
            {metadata.indexPageTopicsHeadline}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/t/${topic.slug}`}
                className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold text-blue-600 hover:underline mb-2">
                  {topic.title}
                </h2>
                <p className="text-gray-600">{topic.meta_description}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="text-2xl font-semibold text-gray-800 mb-6 mt-12">
        {metadata.indexPageNearYouHeadline}
      </h2>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/p/${post.slug}`}
              className="text-blue-600 text-lg font-medium hover:text-blue-800 hover:underline transition"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex justify-center space-x-6 mt-8">
        {pageNumber > 1 && (
          <Link
            href={`/seite/${pageNumber - 1}`}
            className="text-gray-600 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            &larr; Vorherige
          </Link>
        )}
        {posts.length >= POSTS_PER_PAGE && (
          <Link
            href={`/seite/${pageNumber + 1}`}
            className="text-gray-600 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            Nächste &rarr;
          </Link>
        )}
      </div>

      {faqs && faqs.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mt-16 mb-6">
            Fragen & Antworten
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-gray-200 rounded-lg p-4"
              >
                <summary className="flex justify-between w-full text-lg font-semibold text-gray-800 cursor-pointer">
                  {faq.title}
                  <span className="ml-2 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="mt-2 text-gray-600">{faq.content}</div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
