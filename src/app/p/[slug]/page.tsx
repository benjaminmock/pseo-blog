import { getPostBySlug, getNearbyCitiesBySlug } from "../../posts";
import { notFound } from "next/navigation";

type PostPageProps = {
  params: {
    slug: string;
  };
};

// Function to dynamically set the metadata
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

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <article className="prose lg:prose-xl mb-8">
        {/* <h1 className="font-bold">{post.title}</h1> */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {nearbyCities.length > 0 && (
        <>
          <div className="text-2xl font-bold text-black mb-6">
            Verwandte Seiten
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {nearbyCities.map((city) => (
              <div key={city.slug} className="flex items-start space-x-4">
                {/* Uncomment the icon section if needed */}
                {/* <div className="bg-black rounded-full p-3 text-white">
          </div> */}
                <div>
                  <a
                    href={city.slug}
                    className="text-l font-bold text-black hover:underline"
                  >
                    {city.title}
                  </a>
                  <p className="text-gray-500">{city.meta_description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
