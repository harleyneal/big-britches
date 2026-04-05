import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentClient, ContentPost } from "@/lib/content/types";
import { logAction } from "@/lib/content/logger";
import { distributePost } from "@/lib/content/platforms";
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

    // Get tenant details
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", post.tenant_id)
      .single();

    if (tenantError || !tenant) {
      throw new Error("Tenant not found");
    }

    // Publish to blog if enabled
    const contentClient = tenant as ContentClient;
    let originalUrl = post.original_url || "";

    if (contentClient.platforms_enabled.blog) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        const blogRes = await fetch(`${appUrl}/api/blog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: approvedPost.title,
            body_html: approvedPost.body_html,
            body_markdown: approvedPost.body_markdown,
            excerpt: approvedPost.meta_description,
            status: "published",
            tenant_id: post.tenant_id,
          }),
        });

        if (blogRes.ok) {
          const blogData = await blogRes.json();
          originalUrl = `${contentClient.website_url}/blog/${blogData.post?.slug || approvedPost.slug}`;
        }
      } catch (blogError) {
        console.error("Failed to publish blog post:", blogError);
      }
    }

    if (!originalUrl) {
      originalUrl = `${contentClient.website_url}/blog/${approvedPost.slug}`;
    }

    // Update post with original_url
    await supabase
      .from("content_posts")
      .update({
        original_url: originalUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Distribute to platforms
    const distributionResults = await distributePost(contentClient, {
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
      post.tenant_id,
      "approved",
      `Post "${post.title}" approved and published to blog and platforms`,
      id
    );

    // Send published notification email
    try {
      await sendPublishedEmail(
        approvedPost as ContentPost,
        tenant as ContentClient,
        originalUrl || ""
      );
    } catch (emailError) {
      console.error("Failed to send published email:", emailError);
    }

    return new Response(
      JSON.stringify({
        post: publishedPost,
        distributions,
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
