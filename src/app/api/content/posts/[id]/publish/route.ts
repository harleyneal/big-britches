import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentClient, ContentPost } from "@/lib/content/types";
import { logAction } from "@/lib/content/logger";
import { distributePost } from "@/lib/content/platforms";
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
      blog: null as { success: boolean; url?: string; error?: string } | null,
      distributions: [] as Record<string, unknown>[],
      published_at: new Date().toISOString(),
    };

    // 1. Publish to blog if enabled
    let blogUrl = "";
    const contentClient = client as ContentClient;
    if (contentClient.platforms_enabled.blog) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        const blogRes = await fetch(`${appUrl}/api/blog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: post.title,
            body_html: post.body_html,
            body_markdown: post.body_markdown,
            excerpt: post.meta_description,
            status: "published",
            tenant_id: post.client_id,
          }),
        });

        if (blogRes.ok) {
          const blogData = await blogRes.json();
          blogUrl = `${contentClient.website_url}/blog/${blogData.post?.slug || post.slug}`;
          results.blog = { success: true, url: blogUrl };
        } else {
          results.blog = { success: false, error: "Failed to create blog post" };
        }
      } catch (blogError) {
        const msg = blogError instanceof Error ? blogError.message : String(blogError);
        results.blog = { success: false, error: msg };
      }
    }

    const originalUrl = blogUrl || `${contentClient.website_url}/blog/${post.slug}`;

    // Update post with original_url
    await supabase
      .from("content_posts")
      .update({
        original_url: originalUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    await logAction(
      post.client_id,
      "published",
      `Post "${post.title}" published to blog: ${originalUrl}`,
      id
    );

    // 2. Distribute to platforms
    const distributionResults = await distributePost(
      contentClient,
      {
        ...post,
        original_url: originalUrl,
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
        originalUrl || post.original_url || ""
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
