import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";

/**
 * GET /api/content/logs
 * List activity logs with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const url = new URL(req.url);

    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "20"), 100);
    const tenantId = url.searchParams.get("tenantId");
    const action = url.searchParams.get("action");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("content_logs")
      .select("*", { count: "exact" })
      .order("timestamp", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }
    if (action) {
      query = query.eq("action", action);
    }
    if (dateFrom) {
      query = query.gte("timestamp", dateFrom);
    }
    if (dateTo) {
      query = query.lte("timestamp", dateTo);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        logs: logs || [],
        total: count || 0,
        page,
        pageSize,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Get logs error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
