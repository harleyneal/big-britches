import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentClient, ContentPost } from "@/lib/content/types";
import { logAction } from "@/lib/content/logger";
import { publishToWebsite, distributePost } from "@/lib/content/platforms";
import { sendPublishedEmail } from "@/lib/content/email";

/**
 * POST /api/content/posts/[id]/approve
 * Set post status to approved and trigger publish pipeline
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id } = await params;

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
          error: `Cannot approve posts with status "${post.status}"`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update post to approved
    const { data: approvedPost, error: updateError } = await supabase
      .from("content_posts")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !approvedPost) {
      throw new Error(`Failed to approve post: ${updateError?.message}`);
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

    // Publish to website
    const websiteResult = await publishToWebsite(
      client as ContentClient,
      approvedPost as ContentPost
    );

    let originalUrl = websiteResult.external_url || post.original_url;

    if (websiteResult.success && websiteResult.external_url) {
      // Update post with original_url
      await supabase
        .from("content_posts")
        .update({
          original_url: websiteResult.external_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      originalUrl = websiteResult.external_url;
    }

    // Distribute to platforms
    const distributionResults = await distributePost(client as ContentClient, {
      ...approvedPost,
      original_url: originalUrl,
    } as ContentPost);

    // Save distribution results
    const distributions = [];
    for (const distResult of distributionResults) {
      const { data: dist, error: distError } = await supabase
        .from("content_distributions")
        .insert([
          {
            post_id: id,
            platform: distResult.platform,
            status: distResult.success ? "published" : "failed",
            external_url: distResult.external_url,
            error_message: distResult.error_message,
            published_at: distResult.success
              ? new Date().toISOString()
              : null,
          },
        ])
        .select()
        .single();

      if (!distError && dist) {
        distributions.push(dist);
      }
    }

    // Update post status to published
    const { data: publishedPost } = await supabase
      .from("content_posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    // Log action
    await logAction(
      post.client_id,
      "approved",
      `Post "${post.title}" approved and published to website and platforms`,
      id
    );

    // Send published notification email
    try {
      await sendPublishedEmail(
        approvedPost as ContentPost,
        client as ContentClient,
        originalUrl || ""
      );
    } catch (emailError) {
      console.error("Failed to send published email:", emailError);
    }

    return new Response(
      JSON.stringify({
        post: publishedPost,
        distributions,
        website: websiteResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Approve post error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
