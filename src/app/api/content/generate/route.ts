import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { generateContent } from "@/lib/content/generator";
import { ContentClient, ContentPost } from "@/lib/content/types";
import { logAction } from "@/lib/content/logger";
import { sendApprovalEmail, sendGenerationErrorEmail } from "@/lib/content/email";
import { distributePost } from "@/lib/content/platforms";

/**
 * Shared pipeline logic for both GET (Vercel cron) and POST (manual trigger)
 */
async function runGenerationPipeline(req: NextRequest) {
  // Validate auth: Vercel cron sends Authorization: Bearer <CRON_SECRET>
  // Manual trigger sends x-cron-secret header
  const authHeader = req.headers.get("authorization");
  const cronSecretHeader = req.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET;

  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const isAuthorized =
    (bearerToken && bearerToken === expectedSecret) ||
    (cronSecretHeader && cronSecretHeader === expectedSecret);

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getAdminClient();

  // Fetch all active clients
  const { data: clients, error: clientsError } = await supabase
    .from("content_clients")
    .select("*")
    .eq("active", true);

  if (clientsError || !clients) {
    throw new Error(`Failed to fetch clients: ${clientsError?.message}`);
  }

  const results = {
    total: clients.length,
    successful: 0,
    failed: 0,
    generated: [] as Array<{
      client_id: string;
      post_id: string;
      title: string;
      status: string;
    }>,
    errors: [] as Array<{
      client_id: string;
      error: string;
    }>,
  };

  // Process each client
  for (const client of clients as ContentClient[]) {
    try {
      // Step 1: Generate content
      const generated = await generateContent(client);

      // Step 2: Create post in database
      const postData = {
        client_id: client.id,
        status: client.auto_approve ? "approved" : "pending_approval",
        topic: generated.topic,
        title: generated.title,
        slug: generated.slug,
        meta_description: generated.meta_description,
        body_html: generated.body_html,
        body_markdown: generated.body_markdown,
        cta_text: generated.cta_text,
        cta_url: client.website_url,
        linkedin_version: generated.linkedin_version,
        medium_version: generated.medium_version,
        gbp_version: generated.gbp_version,
        generated_at: new Date().toISOString(),
        approved_at: client.auto_approve ? new Date().toISOString() : null,
      };

      const { data: insertedPost, error: insertError } = await supabase
        .from("content_posts")
        .insert([postData])
        .select()
        .single();

      if (insertError || !insertedPost) {
        throw new Error(`Failed to insert post: ${insertError?.message}`);
      }

      // Step 3: Handle post based on auto_approve setting
      if (client.auto_approve) {
        try {
          // Publish to blog if enabled
          let blogUrl = "";
          if (client.platforms_enabled.blog) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
            const blogRes = await fetch(`${appUrl}/api/blog`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: generated.title,
                body_html: generated.body_html,
                body_markdown: generated.body_markdown,
                excerpt: generated.meta_description,
                tags: [client.industry],
                status: "published",
                tenant_id: client.id,
              }),
            });

            if (blogRes.ok) {
              const blogData = await blogRes.json();
              blogUrl = `${client.website_url}/blog/${blogData.post?.slug || generated.slug}`;
            }
          }

          const originalUrl = blogUrl || `${client.website_url}/blog/${generated.slug}`;

          await supabase
            .from("content_posts")
            .update({ original_url: originalUrl })
            .eq("id", insertedPost.id);

          const distributionResults = await distributePost(client, {
            ...insertedPost,
            original_url: originalUrl,
          } as ContentPost);

          for (const distResult of distributionResults) {
            await supabase.from("content_distributions").insert([
              {
                post_id: insertedPost.id,
                platform: distResult.platform,
                status: distResult.success ? "published" : "failed",
                external_url: distResult.external_url || "",
                error_message: distResult.error_message || "",
                published_at: distResult.success
                  ? new Date().toISOString()
                  : null,
              },
            ]);
          }

          await supabase
            .from("content_posts")
            .update({
              status: "published",
              published_at: new Date().toISOString(),
            })
            .eq("id", insertedPost.id);

          await logAction(
            client.id,
            "published",
            `Post "${generated.title}" auto-published to blog and platforms`,
            insertedPost.id
          );
        } catch (publishError) {
          const message =
            publishError instanceof Error
              ? publishError.message
              : String(publishError);
          await logAction(
            client.id,
            "error",
            `Failed to auto-publish: ${message}`,
            insertedPost.id
          );
        }
      } else {
        const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/admin/content/${insertedPost.id}`;
        await sendApprovalEmail(
          insertedPost as ContentPost,
          client,
          approvalUrl
        );
        await logAction(
          client.id,
          "generated",
          `Post "${generated.title}" created and sent for approval`,
          insertedPost.id
        );
      }

      results.generated.push({
        client_id: client.id,
        post_id: insertedPost.id,
        title: generated.title,
        status: postData.status,
      });
      results.successful++;
    } catch (clientError) {
      const message =
        clientError instanceof Error
          ? clientError.message
          : String(clientError);
      results.errors.push({ client_id: client.id, error: message });
      results.failed++;

      try {
        await sendGenerationErrorEmail(client, message);
        await logAction(client.id, "error", `Generation failed: ${message}`);
      } catch {
        console.error(`Failed to send error email to ${client.id}`);
      }
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * GET /api/content/generate
 * Triggered by Vercel cron (Mon & Thu at 9 AM UTC)
 */
export async function GET(req: NextRequest) {
  try {
    return await runGenerationPipeline(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Generate pipeline error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * POST /api/content/generate
 * Manual trigger from admin dashboard
 */
export async function POST(req: NextRequest) {
  try {
    return await runGenerationPipeline(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Generate pipeline error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
