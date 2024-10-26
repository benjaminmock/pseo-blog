import { metadata, faqs } from "@/config";
import { getAllPosts, getMarkdownContent, getAllTopics } from "../../posts";
import Link from "next/link";

// Define the Post type
type Post = {
  title: string;
  slug: string;
};

type Topic = {
  title: string;
  slug: string;
  meta_description: string;
};

const POSTS_PER_PAGE = 10;

export default async function PaginatedPage({
  params,
}: {
  params: { page: string };
}) {
  const pageNumber = parseInt(params.page, 10) || 1;
  const posts: Post[] = await getAllPosts(pageNumber, POSTS_PER_PAGE);
  const topics: Topic[] = await getAllTopics();
  const content = await getMarkdownContent("./src/config/index.md");

  return (
    <div className="max-w-2xl mx-auto">
      {/* <h1 className="text-4xl font-bold mb-6">{metadata.indexPageH1}</h1> */}
      <article className="prose lg:prose-xl mb-8">
        {/* <h1 className="font-bold">{post.title}</h1> */}
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>

      {topics.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-black mt-12 mb-6">
            {metadata.indexPageTopicsHeadline}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/t/${topic.slug}`}
                className="block p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold text-blue-600 hover:underline">
                  {topic.title}
                </h2>
                <p className="text-gray-600">{topic.meta_description}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="text-2xl font-bold text-black mb-6 mt-12">
        {metadata.indexPageNearYouHeadline}
      </h2>
      <ul className="leading-loose text-lg">
        {posts.map((post) => (
          <li key={post.slug} className="mb-4">
            <Link
              href={`/p/${post.slug}`}
              className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
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
            className="px-6 py-3 bg-gray-100 rounded-full hover:bg-gray-200 shadow-md transition"
          >
            &larr; Vorherige
          </Link>
        )}
        {posts.length > POSTS_PER_PAGE && (
          <Link
            href={`/seite/${pageNumber + 1}`}
            className="px-6 py-3 bg-gray-100 rounded-full hover:bg-gray-200 shadow-md transition"
          >
            Nächste &rarr;
          </Link>
        )}
      </div>

      {faqs.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-black mt-16 mb-6">
            Fragen & Antworten
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border-b border-gray-200 pb-4"
              >
                <summary className="flex justify-between w-full py-2 text-left font-semibold text-lg cursor-pointer">
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
