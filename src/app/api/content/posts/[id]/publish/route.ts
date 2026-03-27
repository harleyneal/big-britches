import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentClient, ContentPost } from "@/lib/content/types";
import { logAction } from "@/lib/content/logger";
import { publishToWebsite, distributePost } from "@/lib/content/platforms";
import { sendPublishedEmail } from "@/lib/content/email";

/**
 * POST /api/content/posts/[id]/publish
 * Manual publish trigger for approved posts
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

    // Check if post is approved (or was previously published)
    if (!["approved", "published"].includes(post.status)) {
      return new Response(
        JSON.stringify({
          error: `Can only publish approved posts, current status: "${post.status}"`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
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

    const results = {
      website: null as { platform: string; success: boolean; external_url?: string; error_message?: string } | null,
      distributions: [] as Record<string, unknown>[],
      published_at: new Date().toISOString(),
    };

    // 1. Publish to website
    const websiteResult = await publishToWebsite(
      client as ContentClient,
      post as ContentPost
    );
    results.website = websiteResult;

    if (websiteResult.success && websiteResult.external_url) {
      // Update post with original_url
      await supabase
        .from("content_posts")
        .update({
          original_url: websiteResult.external_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      await logAction(
        post.client_id,
        "published",
        `Post "${post.title}" published to website: ${websiteResult.external_url}`,
        id
      );
    } else {
      await logAction(
        post.client_id,
        "error",
        `Failed to publish to website: ${websiteResult.error_message}`,
        id
      );
    }

    // 2. Distribute to platforms
    const distributionResults = await distributePost(
      client as ContentClient,
      {
        ...post,
        original_url: websiteResult.external_url || post.original_url,
      } as ContentPost
    );

    // Save each distribution result
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
        results.distributions.push(dist);
      }

      // Log platform distribution
      if (distResult.success) {
        await logAction(
          post.client_id,
          "distributed",
          `Post "${post.title}" published to ${distResult.platform}`,
          id,
          distResult.platform
        );
      } else {
        await logAction(
          post.client_id,
          "error",
          `Failed to publish to ${distResult.platform}: ${distResult.error_message}`,
          id,
          distResult.platform
        );
      }
    }

    // 3. Update post status to published
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

    // 4. Send published notification email
    try {
      await sendPublishedEmail(
        publishedPost as ContentPost,
        client as ContentClient,
        websiteResult.external_url || post.original_url || ""
      );
    } catch (emailError) {
      console.error("Failed to send published email:", emailError);
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Publish post error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
