import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentClient, ContentPost } from "@/lib/content/types";
import { logAction } from "@/lib/content/logger";
import { sendRejectionEmail } from "@/lib/content/email";

interface RejectRequest {
  reason: string;
}

/**
 * POST /api/content/posts/[id]/reject
 * Set post status to rejected with reason
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id } = await params;
    const body = (await req.json()) as RejectRequest;
    const { reason } = body;

    if (!reason) {
      return new Response(
        JSON.stringify({ error: "Reason field is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the post
    const { data: post, error: postError } = await supabase
      .from("content_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if post is pending approval
    if (post.status !== "pending_approval") {
      return new Response(
        JSON.stringify({
          error: `Cannot reject posts with status "${post.status}"`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update post to rejected
    const { data: rejectedPost, error: updateError } = await supabase
      .from("content_posts")
      .update({
        status: "rejected",
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !rejectedPost) {
      throw new Error(`Failed to reject post: ${updateError?.message}`);
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from("content_clients")
      .select("*")
      .eq("id", post.client_id)
      .single();

    if (clientError || !client) {
      throw new Error("Client not found");
    }

    // Log action
    await logAction(
      post.client_id,
      "rejected",
      `Post "${post.title}" rejected. Reason: ${reason}`,
      id
    );

    // Send rejection email
    try {
      await sendRejectionEmail(
        rejectedPost as ContentPost,
        client as ContentClient,
        reason
      );
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    return new Response(JSON.stringify({ post: rejectedPost }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Reject post error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
