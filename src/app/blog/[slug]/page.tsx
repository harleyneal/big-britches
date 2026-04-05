"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body_html: string;
  featured_image_url: string | null;
  meta_description: string | null;
  tags: string[];
  author_name: string | null;
  published_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        // Fetch all published posts and find by slug
        const res = await fetch("/api/blog?status=published");
        const data = await res.json();
        const found = (data.posts ?? []).find(
          (p: BlogPost) => p.slug === slug
        );
        if (found) {
          // Fetch full post content
          setPost(found);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--sl-ice)] flex items-center justify-center">
        <p className="text-[var(--sl-navy)] opacity-60">Loading...</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[var(--sl-ice)] flex flex-col items-center justify-center">
        <p className="text-[var(--sl-navy)] text-xl mb-4">Post not found</p>
        <Link
          href="/blog"
          className="text-[var(--sl-blue)] hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--sl-ice)]">
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-[var(--sl-blue)] hover:underline mb-8"
        >
          <ArrowLeft size={14} />
          Back to blog
        </Link>

        {post.featured_image_url && (
          <div className="w-full h-64 rounded-xl overflow-hidden mb-8">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-[var(--sl-navy)] mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-[var(--sl-navy)] opacity-50 mb-8">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {post.author_name && <span>by {post.author_name}</span>}
        </div>

        {post.tags?.length > 0 && (
          <div className="flex gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 bg-[var(--sl-blue-10)] text-[var(--sl-blue)] rounded-full text-xs font-medium"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="prose prose-slate max-w-none text-[var(--sl-navy)]"
          dangerouslySetInnerHTML={{ __html: post.body_html }}
        />
      </article>
    </div>
  );
}
