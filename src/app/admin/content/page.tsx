"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import type { ContentPost } from "@/lib/content/types";

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}

export default function Dashboard() {
  const [recentPosts, setRecentPosts] = useState<ContentPost[]>([]);
  const [postStats, setPostStats] = useState({ total: 0, pending: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pendingRes, publishedRes] = await Promise.all([
        fetch("/api/content/posts"),
        fetch("/api/content/posts?status=pending_approval"),
        fetch("/api/content/posts?status=published"),
      ]);

      const [all, pending, published] = await Promise.all([
        allRes.json(),
        pendingRes.json(),
        publishedRes.json(),
      ]);

      setPostStats({
        total: all.posts?.length || 0,
        pending: pending.posts?.length || 0,
        published: published.posts?.length || 0,
      });

      // Get most recent 5 posts for activity feed
      const sorted = (all.posts || [])
        .sort((a: ContentPost, b: ContentPost) =>
          new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
        )
        .slice(0, 5);
      setRecentPosts(sorted);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Quick stat cards — placeholder values for orders/clients until those APIs exist
  const quickStats: QuickStat[] = [
    {
      label: "New Clients",
      value: "—",
      change: "Coming soon",
      trend: "neutral",
      icon: Users,
      color: "var(--sl-blue)",
    },
    {
      label: "Active Orders",
      value: "—",
      change: "Coming soon",
      trend: "neutral",
      icon: ShoppingCart,
      color: "var(--sl-lime)",
    },
    {
      label: "Published Posts",
      value: String(postStats.published),
      change: `${postStats.pending} pending`,
      trend: postStats.published > 0 ? "up" : "neutral",
      icon: Share2,
      color: "var(--sl-blue)",
    },
    {
      label: "Total Content",
      value: String(postStats.total),
      change: "All time",
      trend: "neutral",
      icon: TrendingUp,
      color: "var(--sl-navy)",
    },
  ];

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
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) =>
    status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sl-navy)]">Dashboard</h1>
          <p className="text-[var(--sl-navy)] opacity-60 mt-1">
            Quick snapshot of your business activity
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="p-2.5 rounded-lg border border-[var(--sl-blue-10)] hover:bg-[var(--sl-ice)] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className={`text-[var(--sl-navy)] opacity-60 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-[var(--sl-blue-10)] hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                {stat.trend === "up" && (
                  <ArrowUpRight size={18} className="text-[var(--sl-lime)]" />
                )}
                {stat.trend === "down" && (
                  <ArrowDownRight size={18} className="text-red-500" />
                )}
              </div>
              <p className="text-2xl font-bold text-[var(--sl-navy)]">{stat.value}</p>
              <p className="text-sm text-[var(--sl-navy)] opacity-50 mt-1">{stat.label}</p>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Two-column layout: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Social Posts — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--sl-blue-10)]">
          <div className="flex items-center justify-between p-5 border-b border-[var(--sl-blue-10)]">
            <h2 className="text-lg font-semibold text-[var(--sl-navy)]">Recent Social Posts</h2>
            <Link
              href="/admin/social"
              className="text-sm text-[var(--sl-blue)] hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[var(--sl-navy)] opacity-50">Loading...</div>
          ) : recentPosts.length === 0 ? (
            <div className="p-8 text-center">
              <Share2 size={32} className="mx-auto text-[var(--sl-navy)] opacity-20 mb-3" />
              <p className="text-sm text-[var(--sl-navy)] opacity-50">No posts yet</p>
              <p className="text-xs text-[var(--sl-navy)] opacity-30 mt-1">
                Generated content will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--sl-blue-10)]">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-[var(--sl-ice)] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[var(--sl-ice)] flex items-center justify-center shrink-0">
                    <Share2 size={16} className="text-[var(--sl-blue)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--sl-navy)] truncate">
                      {post.title}
                    </p>
                    <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">
                      {new Date(post.generated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${getStatusColor(post.status)}`}
                  >
                    {getStatusLabel(post.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions — 1/3 width */}
        <div className="space-y-6">
          {/* Pending Approvals Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
            <h3 className="text-base font-semibold text-[var(--sl-navy)] mb-4">Needs Attention</h3>
            <div className="space-y-3">
              <Link
                href="/admin/content/clients"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--sl-ice)] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--sl-blue-10)] flex items-center justify-center">
                  <Users size={16} className="text-[var(--sl-blue)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--sl-navy)] group-hover:text-[var(--sl-blue)] transition-colors">
                    Manage Clients
                  </p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Add or edit client profiles</p>
                </div>
              </Link>

              {postStats.pending > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--sl-blue-10)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--sl-blue-20)] flex items-center justify-center">
                    <Clock size={16} className="text-[var(--sl-blue)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--sl-navy)]">
                      {postStats.pending} post{postStats.pending !== 1 ? "s" : ""} pending
                    </p>
                    <p className="text-xs text-[var(--sl-navy)] opacity-50">Awaiting your review</p>
                  </div>
                </div>
              )}

              <Link
                href="/admin/social"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--sl-ice)] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--sl-lime-20)] flex items-center justify-center">
                  <Share2 size={16} className="text-[var(--sl-lime)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--sl-navy)] group-hover:text-[var(--sl-blue)] transition-colors">
                    Social Media
                  </p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Schedule & publish posts</p>
                </div>
              </Link>

              <Link
                href="/admin/content/logs"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--sl-ice)] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Eye size={16} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--sl-navy)] group-hover:text-[var(--sl-blue)] transition-colors">
                    Activity Logs
                  </p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Review recent activity</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Placeholder: Orders Summary */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
            <h3 className="text-base font-semibold text-[var(--sl-navy)] mb-3">Orders</h3>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <ShoppingCart size={28} className="mx-auto text-[var(--sl-navy)] opacity-15 mb-2" />
                <p className="text-xs text-[var(--sl-navy)] opacity-40">
                  Order tracking coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
