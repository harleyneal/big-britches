"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Tag, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  meta_description: string | null;
  tags: string[];
  author_name: string | null;
  published_at: string;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog?status=published");
        const data = await res.json();
        setPosts(data.posts ?? []);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--sl-ice)] flex items-center justify-center">
        <p className="text-[var(--sl-navy)] opacity-60">Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--sl-ice)]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[var(--sl-navy)] mb-2">Blog</h1>
        <p className="text-[var(--sl-navy)] opacity-60 mb-12">
          Latest news, tips, and updates
        </p>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-[var(--sl-navy)] opacity-50">
            <p className="text-lg">No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-xl border border-[var(--sl-blue-10)] p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex gap-6">
                  {post.featured_image_url && (
                    <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-[var(--sl-navy)] group-hover:text-[var(--sl-blue)] transition-colors mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[var(--sl-navy)] opacity-70 text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[var(--sl-navy)] opacity-50">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {post.author_name && (
                        <span>by {post.author_name}</span>
                      )}
                      {post.tags?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {post.tags.slice(0, 3).join(", ")}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[var(--sl-blue)] group-hover:gap-2 transition-all">
                      Read more <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
