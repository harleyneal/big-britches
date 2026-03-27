"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Eye, CheckCircle, XCircle, Send } from "lucide-react";
import type { ContentPost } from "@/lib/content/types";

type PostStatus = "all" | "pending_approval" | "published" | "rejected";

interface StatsData {
  total: number;
  pending: number;
  published: number;
  rejected: number;
}

export default function ContentDashboard() {
  const [activeTab, setActiveTab] = useState<PostStatus>("all");
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    pending: 0,
    published: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch posts based on active tab
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        activeTab === "all"
          ? ""
          : `?status=${activeTab}`;
      const response = await fetch(`/api/content/posts${query}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const [totalRes, pendingRes, publishedRes, rejectedRes] = await Promise.all([
        fetch("/api/content/posts"),
        fetch("/api/content/posts?status=pending_approval"),
        fetch("/api/content/posts?status=published"),
        fetch("/api/content/posts?status=rejected"),
      ]);

      const [total, pending, published, rejected] = await Promise.all([
        totalRes.json(),
        pendingRes.json(),
        publishedRes.json(),
        rejectedRes.json(),
      ]);

      setStats({
        total: total.posts?.length || 0,
        pending: pending.posts?.length || 0,
        published: published.posts?.length || 0,
        rejected: rejected.posts?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchPosts();
    fetchStats();
    const interval = setInterval(() => {
      fetchPosts();
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchPosts, fetchStats]);

  // Handle generate content
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await fetchPosts();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Handle approve
  const handleApprove = async (postId: string) => {
    try {
      const response = await fetch(`/api/content/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        await fetchPosts();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error approving post:", error);
    }
  };

  // Handle reject
  const handleReject = async (postId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/content/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejection_reason: reason }),
      });

      if (response.ok) {
        await fetchPosts();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error rejecting post:", error);
    }
  };

  // Handle publish
  const handlePublish = async (postId: string) => {
    try {
      const response = await fetch(`/api/content/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });

      if (response.ok) {
        await fetchPosts();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error publishing post:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "bg-[var(--sl-blue-20)] text-[var(--sl-blue)]";
      case "approved":
        return "bg-[var(--sl-lime-20)] text-[var(--sl-lime)]";
      case "published":
        return "bg-[var(--sl-lime-20)] text-[var(--sl-lime)]";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  };

  const filteredPosts = activeTab === "all" ? posts : posts.filter((p) => p.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sl-navy)]">Content Publishing</h1>
          <p className="text-[var(--sl-navy)] opacity-60 mt-1">Manage and publish your content across platforms</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-6 py-2 bg-[var(--sl-blue)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2 font-medium"
        >
          {generating && <RefreshCw size={18} className="animate-spin" />}
          Generate Now
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-[var(--sl-blue-10)]">
          <p className="text-sm text-[var(--sl-navy)] opacity-60 mb-2">Total Posts</p>
          <p className="text-3xl font-bold text-[var(--sl-navy)]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-[var(--sl-blue-10)]">
          <p className="text-sm text-[var(--sl-navy)] opacity-60 mb-2">Pending Approval</p>
          <p className="text-3xl font-bold text-[var(--sl-blue)]">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-[var(--sl-blue-10)]">
          <p className="text-sm text-[var(--sl-navy)] opacity-60 mb-2">Published</p>
          <p className="text-3xl font-bold text-[var(--sl-lime)]">{stats.published}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-[var(--sl-blue-10)]">
          <p className="text-sm text-[var(--sl-navy)] opacity-60 mb-2">Rejected</p>
          <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--sl-blue-10)]">
        <div className="flex gap-6">
          {(["all", "pending_approval", "published", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[var(--sl-blue)] text-[var(--sl-blue)]"
                  : "border-transparent text-[var(--sl-navy)] opacity-60 hover:opacity-100"
              }`}
            >
              {tab === "all" ? "All" : getStatusLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg border border-[var(--sl-blue-10)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--sl-navy)] opacity-60">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-[var(--sl-navy)] opacity-60">No posts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--sl-ice)] border-b border-[var(--sl-blue-10)]">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">Title</th>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">Client</th>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">Generated</th>
                  <th className="text-right px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sl-blue-10)]">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[var(--sl-ice)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--sl-navy)]">{post.title}</p>
                      <p className="text-sm text-[var(--sl-navy)] opacity-60">{post.topic}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--sl-navy)]">{post.client_id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--sl-navy)] opacity-60">
                      {new Date(post.generated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setShowPreview(true);
                          }}
                          className="p-2 hover:bg-[var(--sl-blue-10)] rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye size={18} className="text-[var(--sl-blue)]" />
                        </button>

                        {post.status === "pending_approval" && (
                          <>
                            <button
                              onClick={() => handleApprove(post.id)}
                              className="p-2 hover:bg-[var(--sl-lime-20)] rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} className="text-[var(--sl-lime)]" />
                            </button>
                            <button
                              onClick={() => handleReject(post.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} className="text-red-600" />
                            </button>
                          </>
                        )}

                        {post.status === "approved" && (
                          <button
                            onClick={() => handlePublish(post.id)}
                            className="p-2 hover:bg-[var(--sl-blue-10)] rounded-lg transition-colors"
                            title="Publish"
                          >
                            <Send size={18} className="text-[var(--sl-blue)]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--sl-ice)] border-b border-[var(--sl-blue-10)] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--sl-navy)]">{selectedPost.title}</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-[var(--sl-navy)] opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div
                className="prose prose-sm max-w-none text-[var(--sl-navy)]"
                dangerouslySetInnerHTML={{ __html: selectedPost.body_html }}
              />
              <div className="mt-6 p-4 bg-[var(--sl-ice)] rounded-lg">
                <p className="text-sm font-medium text-[var(--sl-navy)] mb-2">Meta Description</p>
                <p className="text-sm text-[var(--sl-navy)] opacity-80">{selectedPost.meta_description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
