import {
  getPostBySlug,
  getNearbyCitiesBySlug,
  getEntriesByCitySlug,
  getCategoriesForSlug,
} from "@/app/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Key } from "react";
import Image from "next/image";
import { hasHeroImages } from "@/config";

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

export default async function KursPage({ params }: PostPageProps) {
  return <main className="max-w-4xl mx-auto">Kurse</main>;
}
