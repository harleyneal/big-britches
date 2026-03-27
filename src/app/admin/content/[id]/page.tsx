"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, X, ExternalLink } from "lucide-react";
import type { ContentPost, ContentDistribution } from "@/lib/content/types";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<ContentPost | null>(null);
  const [distributions, setDistributions] = useState<ContentDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [rejectingReason, setRejectingReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    meta_description: "",
    body_markdown: "",
  });

  // Fetch post and distributions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, distRes] = await Promise.all([
          fetch(`/api/content/posts/${postId}`),
          fetch(`/api/content/distributions?post_id=${postId}`),
        ]);

        const postData = await postRes.json();
        const distData = await distRes.json();

        setPost(postData.post);
        setDistributions(distData.distributions || []);

        if (postData.post) {
          setEditData({
            title: postData.post.title,
            meta_description: postData.post.meta_description,
            body_markdown: postData.post.body_markdown,
          });
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/content/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        const updated = await response.json();
        setPost(updated.post);
      }
    } catch (error) {
      console.error("Error approving post:", error);
    }
  };

  const handleReject = async () => {
    if (!rejectingReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const response = await fetch(`/api/content/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejection_reason: rejectingReason,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setPost(updated.post);
        setShowRejectForm(false);
        setRejectingReason("");
      }
    } catch (error) {
      console.error("Error rejecting post:", error);
    }
  };

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/content/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });

      if (response.ok) {
        const updated = await response.json();
        setPost(updated.post);
      }
    } catch (error) {
      console.error("Error publishing post:", error);
    }
  };

  const handleSaveEdits = async () => {
    try {
      const response = await fetch(`/api/content/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editData.title,
          meta_description: editData.meta_description,
          body_markdown: editData.body_markdown,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setPost(updated.post);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[var(--sl-navy)] opacity-60">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-12 text-[var(--sl-navy)] opacity-60">Post not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-[var(--sl-blue)] hover:opacity-80 font-medium"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          {post.status === "pending_approval" && (
            <>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-[var(--sl-lime)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
              >
                Reject
              </button>
            </>
          )}

          {post.status === "approved" && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-[var(--sl-blue)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Post Meta */}
          <div className="bg-white rounded-lg border border-[var(--sl-blue-10)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-[var(--sl-navy)]">
                {editing ? (
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg"
                  />
                ) : (
                  post.title
                )}
              </h1>
              <button
                onClick={() => setEditing(!editing)}
                className="text-[var(--sl-blue)] hover:opacity-80 font-medium text-sm"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Topic</p>
                <p className="text-sm text-[var(--sl-navy)]">{post.topic}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Meta Description</p>
                {editing ? (
                  <textarea
                    value={editData.meta_description}
                    onChange={(e) => setEditData({ ...editData, meta_description: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-[var(--sl-navy)]">{post.meta_description}</p>
                )}
              </div>

              <div className="flex gap-4 text-xs text-[var(--sl-navy)] opacity-60">
                <span>Generated: {new Date(post.generated_at).toLocaleString()}</span>
                {post.approved_at && <span>Approved: {new Date(post.approved_at).toLocaleString()}</span>}
                {post.published_at && <span>Published: {new Date(post.published_at).toLocaleString()}</span>}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3 pt-3 border-t border-[var(--sl-blue-10)]">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  post.status === "pending_approval"
                    ? "bg-[var(--sl-blue-20)] text-[var(--sl-blue)]"
                    : post.status === "approved" || post.status === "published"
                      ? "bg-[var(--sl-lime-20)] text-[var(--sl-lime)]"
                      : post.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                }`}
              >
                {post.status.replace(/_/g, " ").charAt(0).toUpperCase() + post.status.slice(1).replace(/_/g, " ")}
              </span>
            </div>

            {post.rejection_reason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{post.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="bg-white rounded-lg border border-[var(--sl-blue-10)] p-6">
            <h2 className="text-lg font-bold text-[var(--sl-navy)] mb-4">Content</h2>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Markdown Content</label>
                  <textarea
                    value={editData.body_markdown}
                    onChange={(e) => setEditData({ ...editData, body_markdown: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm font-mono"
                    rows={12}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-[var(--sl-blue-10)] text-[var(--sl-navy)] rounded-lg hover:bg-[var(--sl-ice)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="px-4 py-2 bg-[var(--sl-blue)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none text-[var(--sl-navy)]"
                dangerouslySetInnerHTML={{ __html: post.body_html }}
              />
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Rejection Form */}
          {showRejectForm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-900 mb-3">Reject Post</h3>
              <textarea
                value={rejectingReason}
                onChange={(e) => setRejectingReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm mb-3"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Platform Previews */}
          <div className="bg-white rounded-lg border border-[var(--sl-blue-10)] p-6">
            <h3 className="font-bold text-[var(--sl-navy)] mb-4">Platform Versions</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-2">LinkedIn Version</p>
                <div className="bg-[var(--sl-ice)] rounded p-3 text-sm text-[var(--sl-navy)] max-h-40 overflow-y-auto border border-[var(--sl-blue-10)]">
                  {post.linkedin_version}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-2">Medium Version</p>
                <div className="bg-[var(--sl-ice)] rounded p-3 text-sm text-[var(--sl-navy)] max-h-40 overflow-y-auto border border-[var(--sl-blue-10)]">
                  {post.medium_version}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-2">Google Business Profile Version</p>
                <div className="bg-[var(--sl-ice)] rounded p-3 text-sm text-[var(--sl-navy)] max-h-40 overflow-y-auto border border-[var(--sl-blue-10)]">
                  {post.gbp_version}
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Results */}
          {post.status === "published" && distributions.length > 0 && (
            <div className="bg-white rounded-lg border border-[var(--sl-blue-10)] p-6">
              <h3 className="font-bold text-[var(--sl-navy)] mb-4">Distribution Results</h3>

              <div className="space-y-3">
                {distributions.map((dist) => (
                  <div key={dist.id} className="flex items-center justify-between p-3 bg-[var(--sl-ice)] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[var(--sl-navy)]">
                        {dist.platform.replace(/_/g, " ").toUpperCase()}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          dist.status === "published"
                            ? "text-[var(--sl-lime)]"
                            : dist.status === "failed"
                              ? "text-red-600"
                              : "text-[var(--sl-blue)]"
                        }`}
                      >
                        {dist.status}
                      </p>
                    </div>
                    {dist.external_url && (
                      <a
                        href={dist.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--sl-blue)] hover:opacity-80"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
