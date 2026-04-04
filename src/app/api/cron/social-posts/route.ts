import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { publishPost } from "@/lib/social/platforms";

// Cron job: runs twice a week (Tue + Fri at 10:00 UTC)
// Vercel Cron calls this with a secret to prevent unauthorized access

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role key for cron (no user session)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Get all tenants with auto-posting enabled
  const { data: autoSettings } = await supabase
    .from("social_auto_settings")
    .select("*, tenants(id, name)")
    .eq("enabled", true);

  if (!autoSettings?.length) {
    return NextResponse.json({ message: "No auto-post settings enabled", processed: 0 });
  }

  const today = new Date().getDay(); // 0=Sun
  const results = [];

  for (const settings of autoSettings) {
    // Check if today is a post day for this tenant
    if (!settings.post_days?.includes(today)) continue;

    const tenantId = settings.tenant_id;

    // Get the target accounts
    const { data: accounts } = await supabase
      .from("social_accounts")
      .select("*")
      .in("id", settings.auto_post_account_ids)
      .eq("is_active", true);

    if (!accounts?.length) continue;

    try {
      // Generate trending topic
      const trendRes = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system:
          "You are a trend researcher. Given a business type and optional content topics, suggest ONE specific trending topic or news angle that would be relevant and timely for a social media post. Be specific and current. Return ONLY the topic.",
        messages: [
          {
            role: "user",
            content: `Business type: ${settings.business_type || "small business"}. Content topics they're interested in: ${settings.content_topics?.join(", ") || "general business tips"}. Suggest a trending topic for this week.`,
          },
        ],
      });

      const trendingTopic = trendRes.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      // Generate the post
      const postRes = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: `You are a social media content creator for small businesses. Write an engaging, professional post.
- Friendly, ${settings.tone || "professional"} tone
- Keep it concise — 1-3 short paragraphs
- Include 2-3 relevant hashtags
- Make it shareable and authentic
Return ONLY the post content.`,
        messages: [
          {
            role: "user",
            content: `Write a social media post for a ${settings.business_type || "small business"}.
Topic: ${trendingTopic}
Tone: ${settings.tone || "professional"}`,
          },
        ],
      });

      const postContent = postRes.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      // Determine initial status based on approval setting
      const postStatus = settings.require_approval ? "pending_approval" : "approved";

      // Create the social post
      const { data: post } = await supabase
        .from("social_posts")
        .insert({
          tenant_id: tenantId,
          content: postContent,
          post_type: "ai_generated",
          status: postStatus,
          ai_prompt: settings.content_topics?.join(", ") || null,
          ai_trending_topic: trendingTopic,
        })
        .select()
        .single();

      if (!post) continue;

      // Create targets
      const targets = accounts.map((account: { id: string }) => ({
        post_id: post.id,
        social_account_id: account.id,
      }));
      await supabase.from("social_post_targets").insert(targets);

      // If auto-approve is on, publish immediately
      if (!settings.require_approval) {
        for (const account of accounts) {
          try {
            const result = await publishPost(
              account.platform,
              account.access_token,
              account.platform_page_id,
              postContent
            );

            const platformPostId = result.id ?? result.name ?? null;

            await supabase
              .from("social_post_targets")
              .update({
                status: "published",
                platform_post_id: platformPostId,
                published_at: new Date().toISOString(),
              })
              .eq("post_id", post.id)
              .eq("social_account_id", account.id);
          } catch (err) {
            await supabase
              .from("social_post_targets")
              .update({
                status: "failed",
                error_message: (err as Error).message,
              })
              .eq("post_id", post.id)
              .eq("social_account_id", account.id);
          }
        }

        await supabase
          .from("social_posts")
          .update({ status: "published", published_at: new Date().toISOString() })
          .eq("id", post.id);
      }

      results.push({ tenant: tenantId, postId: post.id, status: postStatus });
    } catch (err) {
      results.push({ tenant: tenantId, error: (err as Error).message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
