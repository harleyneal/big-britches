"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  Send,
  Sparkles,
  Link2,
  Bot,
  MessageCircle,
  Camera,
  MapPin,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  Loader2,
  Zap,
  Eye,
  AlertCircle,
  FileText,
} from "lucide-react";

type Tab = "compose" | "queue" | "integrations" | "automation";

interface SocialAccount {
  id: string;
  platform: "facebook" | "instagram" | "google_business";
  platform_page_id: string;
  platform_page_name: string;
  platform_page_avatar: string | null;
  is_active: boolean;
  connected_at: string;
  token_expires_at: string | null;
}

interface PostTarget {
  id: string;
  status: string;
  platform_post_id: string | null;
  error_message: string | null;
  social_accounts: { id: string; platform: string; platform_page_name: string };
}

interface SocialPost {
  id: string;
  content: string;
  media_urls: string[];
  post_type: string;
  status: string;
  ai_trending_topic: string | null;
  created_at: string;
  published_at: string | null;
  social_post_targets: PostTarget[];
}

interface AutoSettings {
  enabled: boolean;
  auto_post_account_ids: string[];
  business_type: string;
  content_topics: string[];
  tone: string;
  require_approval: boolean;
  post_days: number[];
  post_time: string;
}

const PLATFORM_META: Record<
  string,
  { label: string; icon: typeof MessageCircle; color: string; bg: string }
> = {
  blog: { label: "Blog", icon: FileText, color: "text-[var(--sl-blue)]", bg: "bg-[var(--sl-blue-10)]" },
  facebook: { label: "Facebook", icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
  instagram: { label: "Instagram", icon: Camera, color: "text-pink-600", bg: "bg-pink-50" },
  google_business: {
    label: "Google Business",
    icon: MapPin,
    color: "text-green-600",
    bg: "bg-green-50",
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SocialMediaPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) ?? "compose";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Accounts
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Compose
  const [composeContent, setComposeContent] = useState("");
  const [composeBlogTitle, setComposeBlogTitle] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [postToBlog, setPostToBlog] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);

  // AI Generate
  const [aiTopic, setAiTopic] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [aiTrendingTopic, setAiTrendingTopic] = useState<string | null>(null);

  // Queue
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [queueFilter, setQueueFilter] = useState<string>("all");

  // Auto settings
  const [autoSettings, setAutoSettings] = useState<AutoSettings>({
    enabled: false,
    auto_post_account_ids: [],
    business_type: "",
    content_topics: [],
    tone: "professional",
    require_approval: true,
    post_days: [2, 5],
    post_time: "10:00",
  });
  const [savingAuto, setSavingAuto] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  // Connecting
  const [connecting, setConnecting] = useState<string | null>(null);

  // Success/error banners from OAuth redirects
  const oauthSuccess = searchParams.get("success");
  const oauthError = searchParams.get("error");

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    const res = await fetch("/api/social/accounts");
    const data = await res.json();
    setAccounts(data.accounts ?? []);
    setLoadingAccounts(false);
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    const res = await fetch("/api/social/posts");
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoadingPosts(false);
  }, []);

  const fetchAutoSettings = useCallback(async () => {
    const res = await fetch("/api/social/auto-settings");
    const data = await res.json();
    if (data.settings) setAutoSettings(data.settings);
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchPosts();
    fetchAutoSettings();
  }, [fetchAccounts, fetchPosts, fetchAutoSettings]);

  // ─── Connect handler ───────────────────────────────────────────
  async function handleConnect(platform: string) {
    setConnecting(platform);
    const res = await fetch("/api/social/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    const data = await res.json();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
    setConnecting(null);
  }

  // ─── Disconnect handler ────────────────────────────────────────
  async function handleDisconnect(accountId: string) {
    await fetch("/api/social/accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });
    fetchAccounts();
  }

  // ─── Manual publish ────────────────────────────────────────────
  async function handlePublish() {
    const hasTargets = selectedAccountIds.length > 0 || postToBlog;
    if (!composeContent.trim() || !hasTargets) return;
    setPublishing(true);
    setPublishResult(null);

    const results: string[] = [];
    let allSucceeded = true;

    // Publish to blog if selected
    if (postToBlog) {
      try {
        const blogTitle = composeBlogTitle.trim() || composeContent.slice(0, 60).trim();
        const blogRes = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: blogTitle,
            body_html: `<div>${composeContent.replace(/\n/g, "<br/>")}</div>`,
            body_markdown: composeContent,
            excerpt: composeContent.slice(0, 160),
            status: "published",
          }),
        });
        const blogData = await blogRes.json();
        if (blogData.post) {
          results.push("Blog");
        } else {
          allSucceeded = false;
          results.push(`Blog failed: ${blogData.error}`);
        }
      } catch {
        allSucceeded = false;
        results.push("Blog failed: network error");
      }
    }

    // Publish to social accounts if any selected
    if (selectedAccountIds.length > 0) {
      const createRes = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: composeContent,
          target_account_ids: selectedAccountIds,
          post_type: "manual",
        }),
      });
      const createData = await createRes.json();
      if (!createData.post) {
        allSucceeded = false;
        results.push(`Social error: ${createData.error}`);
      } else {
        const pubRes = await fetch("/api/social/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: createData.post.id }),
        });
        const pubData = await pubRes.json();

        if (pubData.allSucceeded) {
          results.push("Social media");
        } else {
          allSucceeded = false;
          const failures = pubData.results
            ?.filter((r: { success: boolean }) => !r.success)
            .map((r: { platform: string; error: string }) => `${r.platform}: ${r.error}`)
            .join("; ");
          results.push(`Social partial: ${failures}`);
        }
      }
    }

    if (allSucceeded) {
      setPublishResult(`Posted successfully to: ${results.join(", ")}!`);
      setComposeContent("");
      setComposeBlogTitle("");
      setSelectedAccountIds([]);
      setPostToBlog(false);
    } else {
      setPublishResult(`Results: ${results.join("; ")}`);
    }
    setPublishing(false);
    fetchPosts();
  }

  // ─── AI generate ───────────────────────────────────────────────
  async function handleAiGenerate() {
    setAiGenerating(true);
    setAiPreview(null);

    const res = await fetch("/api/social/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_type: autoSettings.business_type || "small business",
        topic: aiTopic || undefined,
        tone: autoSettings.tone,
      }),
    });
    const data = await res.json();
    setAiPreview(data.content ?? null);
    setAiTrendingTopic(data.trending_topic ?? null);
    setAiGenerating(false);
  }

  function useAiContent() {
    if (aiPreview) {
      setComposeContent(aiPreview);
      setAiPreview(null);
      setAiTrendingTopic(null);
      setAiTopic("");
    }
  }

  // ─── Post actions (approve / reject) ───────────────────────────
  async function handlePostAction(
    postId: string,
    action: "approve" | "reject"
  ) {
    await fetch("/api/social/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, action }),
    });

    // If approved, publish it
    if (action === "approve") {
      await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
    }

    fetchPosts();
  }

  // ─── Save auto settings ────────────────────────────────────────
  async function handleSaveAutoSettings() {
    setSavingAuto(true);
    setAutoSaved(false);
    await fetch("/api/social/auto-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(autoSettings),
    });
    setSavingAuto(false);
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 3000);
  }

  // ─── Toggle helpers ────────────────────────────────────────────
  function toggleAccountSelection(id: string) {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAutoAccount(id: string) {
    setAutoSettings((prev) => ({
      ...prev,
      auto_post_account_ids: prev.auto_post_account_ids.includes(id)
        ? prev.auto_post_account_ids.filter((x) => x !== id)
        : [...prev.auto_post_account_ids, id],
    }));
  }

  function togglePostDay(day: number) {
    setAutoSettings((prev) => ({
      ...prev,
      post_days: prev.post_days.includes(day)
        ? prev.post_days.filter((d) => d !== day)
        : [...prev.post_days, day].sort(),
    }));
  }

  function addTopic() {
    if (newTopic.trim()) {
      setAutoSettings((prev) => ({
        ...prev,
        content_topics: [...prev.content_topics, newTopic.trim()],
      }));
      setNewTopic("");
    }
  }

  function removeTopic(index: number) {
    setAutoSettings((prev) => ({
      ...prev,
      content_topics: prev.content_topics.filter((_, i) => i !== index),
    }));
  }

  const filteredPosts =
    queueFilter === "all"
      ? posts
      : posts.filter((p) => p.status === queueFilter);

  const tabs: { key: Tab; label: string; icon: typeof Send }[] = [
    { key: "compose", label: "Compose", icon: Send },
    { key: "queue", label: "Post Queue", icon: Clock },
    { key: "integrations", label: "Integrations", icon: Link2 },
    { key: "automation", label: "AI Automation", icon: Bot },
  ];

  const STATUS_STYLES: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    pending_approval: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    scheduled: "bg-purple-100 text-purple-700",
    publishing: "bg-blue-100 text-blue-600",
    published: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    rejected: "bg-red-50 text-red-500",
  };

  return (
    <div>
      {/* OAuth banners */}
      {oauthSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
          <CheckCircle size={16} />
          Successfully connected your {oauthSuccess === "meta" ? "Facebook & Instagram" : "Google Business"} account!
        </div>
      )}
      {oauthError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          Connection error: {oauthError}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--sl-navy)]">Social Media</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compose posts, manage your queue, and automate your social presence
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-[var(--sl-blue-10)] p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--sl-blue)] text-white"
                  : "text-gray-500 hover:text-[var(--sl-navy)] hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.key === "queue" &&
                posts.filter((p) => p.status === "pending_approval").length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-yellow-900">
                    {posts.filter((p) => p.status === "pending_approval").length}
                  </span>
                )}
            </button>
          );
        })}
      </div>

      {/* ═══ COMPOSE TAB ═══ */}
      {activeTab === "compose" && (
        <div className="space-y-6">
          {/* AI Assist */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-purple-600" />
              <h3 className="font-semibold text-[var(--sl-navy)]">AI Content Assistant</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Describe a topic or leave blank to get a trending idea for your business
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. summer promotion, industry news, customer tips..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-purple-200 bg-white text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
              >
                {aiGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {aiGenerating ? "Generating..." : "Generate"}
              </button>
            </div>

            {aiPreview && (
              <div className="mt-4 bg-white rounded-lg border border-purple-200 p-4">
                {aiTrendingTopic && (
                  <p className="text-xs text-purple-500 font-medium mb-2">
                    Trending: {aiTrendingTopic}
                  </p>
                )}
                <p className="text-sm text-[var(--sl-navy)] whitespace-pre-wrap">
                  {aiPreview}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={useAiContent}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--sl-blue)] text-white rounded-lg text-xs font-medium hover:bg-[var(--sl-navy)] transition-colors"
                  >
                    <Send size={12} />
                    Use This
                  </button>
                  <button
                    onClick={handleAiGenerate}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Compose area */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <textarea
              value={composeContent}
              onChange={(e) => setComposeContent(e.target.value)}
              placeholder="Write your post content..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              {composeContent.length} characters
            </p>

            {/* Platform selection */}
            <div className="mt-4">
              <p className="text-sm font-medium text-[var(--sl-navy)] mb-2">
                Post to:
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Blog toggle — always available */}
                <button
                  onClick={() => setPostToBlog(!postToBlog)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    postToBlog
                      ? "border-[var(--sl-blue)] bg-[var(--sl-blue-10)] text-[var(--sl-blue)]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <FileText size={16} />
                  Blog
                  {postToBlog && <CheckCircle size={14} />}
                </button>

                {/* Social accounts */}
                {accounts
                  .filter((a) => a.is_active)
                  .map((account) => {
                    const meta = PLATFORM_META[account.platform];
                    const Icon = meta?.icon ?? Link2;
                    const selected = selectedAccountIds.includes(account.id);
                    return (
                      <button
                        key={account.id}
                        onClick={() => toggleAccountSelection(account.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selected
                            ? "border-[var(--sl-blue)] bg-[var(--sl-blue-10)] text-[var(--sl-blue)]"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <Icon size={16} />
                        {account.platform_page_name}
                        {selected && <CheckCircle size={14} />}
                      </button>
                    );
                  })}

                {accounts.filter((a) => a.is_active).length > 0 && (
                  <button
                    onClick={() => {
                      const allIds = accounts
                        .filter((a) => a.is_active)
                        .map((a) => a.id);
                      const allSocialSelected = selectedAccountIds.length === allIds.length;
                      const allSelected = allSocialSelected && postToBlog;
                      if (allSelected) {
                        setSelectedAccountIds([]);
                        setPostToBlog(false);
                      } else {
                        setSelectedAccountIds(allIds);
                        setPostToBlog(true);
                      }
                    }}
                    className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                  >
                    {selectedAccountIds.length === accounts.filter((a) => a.is_active).length && postToBlog
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
              </div>

              {/* Blog title field — shown when Blog is selected */}
              {postToBlog && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={composeBlogTitle}
                    onChange={(e) => setComposeBlogTitle(e.target.value)}
                    placeholder="Blog post title (optional — will use first line if blank)"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] text-sm"
                  />
                </div>
              )}
            </div>

            {/* Publish */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handlePublish}
                disabled={
                  publishing ||
                  !composeContent.trim() ||
                  (selectedAccountIds.length === 0 && !postToBlog)
                }
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--sl-blue)] text-white rounded-lg font-medium hover:bg-[var(--sl-navy)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {publishing ? "Publishing..." : "Publish Now"}
              </button>
              {publishResult && (
                <span
                  className={`text-sm font-medium ${
                    publishResult.startsWith("Posted")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {publishResult}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ QUEUE TAB ═══ */}
      {activeTab === "queue" && (
        <div>
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {["all", "pending_approval", "published", "failed", "rejected"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setQueueFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    queueFilter === f
                      ? "bg-[var(--sl-navy)] text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {f === "all"
                    ? "All"
                    : f
                        .replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              )
            )}
          </div>

          {loadingPosts ? (
            <div className="text-center py-12 text-gray-400">
              <Loader2 size={24} className="animate-spin mx-auto mb-2" />
              Loading posts...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No posts here yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            STATUS_STYLES[post.status] ?? "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {post.status.replace("_", " ")}
                        </span>
                        {post.post_type === "ai_generated" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-600">
                            AI Generated
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--sl-navy)] whitespace-pre-wrap line-clamp-4">
                        {post.content}
                      </p>
                      {post.ai_trending_topic && (
                        <p className="text-xs text-purple-500 mt-1">
                          Trending: {post.ai_trending_topic}
                        </p>
                      )}
                      {/* Platform targets */}
                      <div className="flex gap-1 mt-2">
                        {post.social_post_targets?.map((target) => {
                          const meta =
                            PLATFORM_META[target.social_accounts?.platform];
                          const Icon = meta?.icon ?? Link2;
                          return (
                            <span
                              key={target.id}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                target.status === "published"
                                  ? "bg-green-50 text-green-600"
                                  : target.status === "failed"
                                  ? "bg-red-50 text-red-500"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                              title={
                                target.error_message ??
                                target.social_accounts?.platform_page_name
                              }
                            >
                              <Icon size={10} />
                              {target.social_accounts?.platform_page_name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    {post.status === "pending_approval" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handlePostAction(post.id, "approve")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => handlePostAction(post.id, "reject")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ INTEGRATIONS TAB ═══ */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          {/* Blog card — always connected */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sl-blue-10)] flex items-center justify-center">
                  <FileText size={20} className="text-[var(--sl-blue)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--sl-navy)]">Blog</h3>
                  <p className="text-xs text-gray-400">
                    Publish posts to your website&apos;s blog — always available, no setup needed
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                <CheckCircle size={14} />
                Connected
              </span>
            </div>
          </div>

          {/* Platform cards */}
          {(["facebook", "instagram", "google_business"] as const).map(
            (platform) => {
              const meta = PLATFORM_META[platform];
              const Icon = meta.icon;
              const connected = accounts.filter(
                (a) => a.platform === platform && a.is_active
              );
              return (
                <div
                  key={platform}
                  className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${meta.bg} flex items-center justify-center`}
                      >
                        <Icon size={20} className={meta.color} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--sl-navy)]">
                          {meta.label}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {connected.length > 0
                            ? `${connected.length} account${connected.length > 1 ? "s" : ""} connected`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleConnect(
                          platform === "instagram" ? "instagram" : platform
                        )
                      }
                      disabled={connecting === platform}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        connected.length > 0
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-[var(--sl-blue)] text-white hover:bg-[var(--sl-navy)]"
                      }`}
                    >
                      {connecting === platform ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Link2 size={16} />
                      )}
                      {connected.length > 0 ? "Reconnect" : "Connect"}
                    </button>
                  </div>

                  {/* Connected accounts list */}
                  {connected.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      {connected.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            {account.platform_page_avatar && (
                              <img
                                src={account.platform_page_avatar}
                                alt=""
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span className="text-sm text-[var(--sl-navy)]">
                              {account.platform_page_name}
                            </span>
                            <span className="text-[10px] text-green-500 font-medium">
                              Connected
                            </span>
                          </div>
                          <button
                            onClick={() => handleDisconnect(account.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Disconnect"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          )}

          <p className="text-xs text-gray-400 mt-4">
            Facebook and Instagram are connected via Meta. Connecting Facebook will
            also link any associated Instagram Business accounts.
          </p>
        </div>
      )}

      {/* ═══ AUTOMATION TAB ═══ */}
      {activeTab === "automation" && (
        <div className="space-y-6">
          {/* Enable toggle */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Zap size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--sl-navy)]">
                    AI Auto-Posting
                  </h3>
                  <p className="text-xs text-gray-400">
                    Automatically generate and publish posts on a schedule
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setAutoSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoSettings.enabled ? "bg-[var(--sl-blue)]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    autoSettings.enabled ? "left-6.5 translate-x-0" : "left-0.5"
                  }`}
                  style={{
                    left: autoSettings.enabled ? "26px" : "2px",
                  }}
                />
              </button>
            </div>
          </div>

          {autoSettings.enabled && (
            <>
              {/* Business type */}
              <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
                <h3 className="font-semibold text-[var(--sl-navy)] mb-4">
                  Business Profile
                </h3>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                      Business Type
                    </label>
                    <input
                      type="text"
                      value={autoSettings.business_type}
                      onChange={(e) =>
                        setAutoSettings((prev) => ({
                          ...prev,
                          business_type: e.target.value,
                        }))
                      }
                      placeholder="e.g. plumbing, restaurant, law firm, salon..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                      Content Topics
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTopic()}
                        placeholder="Add a topic and press Enter..."
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] text-sm"
                      />
                      <button
                        onClick={addTopic}
                        className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {autoSettings.content_topics.map((topic, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                        >
                          {topic}
                          <button
                            onClick={() => removeTopic(i)}
                            className="hover:text-purple-900"
                          >
                            <XCircle size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                      Tone
                    </label>
                    <select
                      value={autoSettings.tone}
                      onChange={(e) =>
                        setAutoSettings((prev) => ({
                          ...prev,
                          tone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] text-sm"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="witty">Witty</option>
                      <option value="inspiring">Inspiring</option>
                      <option value="educational">Educational</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
                <h3 className="font-semibold text-[var(--sl-navy)] mb-4">
                  Schedule
                </h3>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">
                      Post Days
                    </label>
                    <div className="flex gap-2">
                      {DAY_NAMES.map((name, i) => (
                        <button
                          key={i}
                          onClick={() => togglePostDay(i)}
                          className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
                            autoSettings.post_days.includes(i)
                              ? "bg-[var(--sl-blue)] text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                      Post Time
                    </label>
                    <input
                      type="time"
                      value={autoSettings.post_time}
                      onChange={(e) =>
                        setAutoSettings((prev) => ({
                          ...prev,
                          post_time: e.target.value,
                        }))
                      }
                      className="w-40 px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Platforms + Approval */}
              <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
                <h3 className="font-semibold text-[var(--sl-navy)] mb-4">
                  Platforms & Approval
                </h3>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">
                      Auto-post to:
                    </label>
                    {accounts.filter((a) => a.is_active).length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No accounts connected.{" "}
                        <button
                          onClick={() => setActiveTab("integrations")}
                          className="text-[var(--sl-blue)] hover:underline"
                        >
                          Connect one first
                        </button>
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {accounts
                          .filter((a) => a.is_active)
                          .map((account) => {
                            const meta = PLATFORM_META[account.platform];
                            const Icon = meta?.icon ?? Link2;
                            const selected =
                              autoSettings.auto_post_account_ids.includes(
                                account.id
                              );
                            return (
                              <button
                                key={account.id}
                                onClick={() => toggleAutoAccount(account.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                  selected
                                    ? "border-purple-400 bg-purple-50 text-purple-700"
                                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                }`}
                              >
                                <Icon size={16} />
                                {account.platform_page_name}
                                {selected && <CheckCircle size={14} />}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-[var(--sl-navy)]">
                        Require approval before posting
                      </p>
                      <p className="text-xs text-gray-400">
                        AI posts will appear in your queue for review
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setAutoSettings((prev) => ({
                          ...prev,
                          require_approval: !prev.require_approval,
                        }))
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        autoSettings.require_approval
                          ? "bg-[var(--sl-blue)]"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                        style={{
                          left: autoSettings.require_approval ? "26px" : "2px",
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveAutoSettings}
                  disabled={savingAuto}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--sl-blue)] text-white rounded-lg font-medium hover:bg-[var(--sl-navy)] transition-colors disabled:opacity-50"
                >
                  {savingAuto ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Bot size={16} />
                  )}
                  {savingAuto ? "Saving..." : "Save Automation Settings"}
                </button>
                {autoSaved && (
                  <span className="text-sm text-green-600 font-medium">
                    Settings saved!
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
