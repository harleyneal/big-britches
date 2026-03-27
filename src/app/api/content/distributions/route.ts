import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";

/**
 * GET /api/content/distributions
 * List distributions, optionally filtered by post_id
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const url = new URL(req.url);
    const postId = url.searchParams.get("post_id");

    let query = supabase
      .from("content_distributions")
      .select("*")
      .order("created_at", { ascending: false });

    if (postId) {
      query = query.eq("post_id", postId);
    }

    const { data: distributions, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch distributions: ${error.message}`);
    }

    return new Response(JSON.stringify({ distributions: distributions || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Get distributions error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
