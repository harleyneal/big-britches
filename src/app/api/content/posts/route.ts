import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentPost } from "@/lib/content/types";

/**
 * GET /api/content/posts
 * List all posts with optional filtering
 * Query params: ?tenant_id=, ?status=, ?limit=, ?offset=
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const url = new URL(req.url);

    // Get query parameters
    const clientId = url.searchParams.get("tenant_id");
    const status = url.searchParams.get("status");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("content_posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (clientId) {
      query = query.eq("tenant_id", clientId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        posts: posts as ContentPost[],
        total: count || 0,
        limit,
        offset,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Get posts error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
