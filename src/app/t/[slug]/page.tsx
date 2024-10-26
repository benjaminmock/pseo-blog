import { getTopicBySlug } from "../../posts";
import { notFound } from "next/navigation";

type PostPageProps = {
  params: {
    slug: string;
  };
};

// Function to dynamically set the metadata
export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = params;
  const post = await getTopicBySlug(slug);

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

export default async function TopicPage({ params }: PostPageProps) {
  const { slug } = params;
  const post = await getTopicBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <article className="prose lg:prose-xl mb-8">
        {/* <h1 className="font-bold">{post.title}</h1> */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
}
