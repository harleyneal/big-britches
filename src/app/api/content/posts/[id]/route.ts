import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentPost } from "@/lib/content/types";

/**
 * GET /api/content/posts/[id]
 * Get a single post by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id } = await params;

    const { data: post, error } = await supabase
      .from("content_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ post: post as ContentPost }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Get post error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * PATCH /api/content/posts/[id]
 * Update post fields (title, body, meta, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id } = await params;
    const updates = await req.json();

    // Don't allow changing certain fields directly
    delete updates.id;
    delete updates.created_at;

    const { data: updatedPost, error } = await supabase
      .from("content_posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !updatedPost) {
      throw new Error(`Failed to update post: ${error?.message}`);
    }

    return new Response(
      JSON.stringify({ post: updatedPost as ContentPost }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Update post error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * DELETE /api/content/posts/[id]
 * Delete a post
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id } = await params;

    // Delete associated distributions first
    await supabase
      .from("content_distributions")
      .delete()
      .eq("post_id", id);

    // Delete the post
    const { error } = await supabase
      .from("content_posts")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Delete post error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
