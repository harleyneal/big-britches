"use client";

import { useState, useEffect, useCallback } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentLog } from "@/lib/content/types";

interface LogsResponse {
  logs: ContentLog[];
  total: number;
}

const ACTIONS = [
  "generated",
  "approved",
  "rejected",
  "published",
  "distributed",
  "error",
];

export default function LogsPage() {
  const [logs, setLogs] = useState<ContentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    clientId: "",
    action: "",
    dateFrom: "",
    dateTo: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());

      if (filters.clientId) params.append("clientId", filters.clientId);
      if (filters.action) params.append("action", filters.action);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const response = await fetch(`/api/content/logs?${params}`);
      const data = (await response.json()) as LogsResponse;

      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      clientId: "",
      action: "",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "generated":
        return "bg-[var(--sl-blue-20)] text-[var(--sl-blue)]";
      case "approved":
        return "bg-[var(--sl-lime-20)] text-[var(--sl-lime)]";
      case "published":
        return "bg-[var(--sl-lime-20)] text-[var(--sl-lime)]";
      case "rejected":
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sl-navy)]">
            Activity Logs
          </h1>
          <p className="text-[var(--sl-navy)] opacity-60 mt-1">
            View content publishing activity and events
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border border-[var(--sl-blue-10)] text-[var(--sl-navy)] rounded-lg hover:bg-[var(--sl-ice)] transition-colors flex items-center gap-2 font-medium"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-[var(--sl-blue-10)] p-6">
          <h2 className="text-lg font-bold text-[var(--sl-navy)] mb-4">
            Filter Logs
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={filters.clientId}
                onChange={(e) =>
                  handleFilterChange("clientId", e.target.value)
                }
                placeholder="Filter by client..."
                className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) =>
                  handleFilterChange("action", e.target.value)
                }
                className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
              >
                <option value="">All Actions</option>
                {ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  handleFilterChange("dateFrom", e.target.value)
                }
                className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  handleFilterChange("dateTo", e.target.value)
                }
                className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-[var(--sl-blue-10)] text-[var(--sl-navy)] rounded-lg hover:bg-[var(--sl-ice)] transition-colors font-medium text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-[var(--sl-blue-10)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--sl-navy)] opacity-60">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[var(--sl-navy)] opacity-60">
            No logs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--sl-ice)] border-b border-[var(--sl-blue-10)]">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">
                    Timestamp
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">
                    Client
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">
                    Post
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">
                    Action
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">
                    Platform
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-[var(--sl-navy)] text-sm">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sl-blue-10)]">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--sl-ice)] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[var(--sl-navy)]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--sl-navy)]">
                      {log.client_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--sl-navy)]">
                      {log.post_id || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action.charAt(0).toUpperCase() +
                          log.action.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--sl-navy)]">
                      {log.platform
                        ? log.platform
                          .replace(/_/g, " ")
                          .toUpperCase()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--sl-navy)] opacity-80">
                      <div className="max-w-xs truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-[var(--sl-blue-10)] px-6 py-4 flex items-center justify-between bg-[var(--sl-ice)]">
            <div className="text-sm text-[var(--sl-navy)] opacity-60">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, total)} of {total} logs
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-[var(--sl-blue-10)]"
              >
                <ChevronLeft size={18} className="text-[var(--sl-navy)]" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 1 && p <= page + 1)
                  )
                  .map((p, idx, arr) => (
                    <div key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 text-[var(--sl-navy)] opacity-60">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          page === p
                            ? "bg-[var(--sl-blue)] text-white"
                            : "hover:bg-white border border-[var(--sl-blue-10)]"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-[var(--sl-blue-10)]"
              >
                <ChevronRight size={18} className="text-[var(--sl-navy)]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
