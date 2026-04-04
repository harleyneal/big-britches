import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishPost } from "@/lib/social/platforms";

// POST /api/social/publish — publish a post to all its target platforms
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { post_id } = await req.json();

  // Get the post
  const { data: post, error: postError } = await supabase
    .from("social_posts")
    .select("*")
    .eq("id", post_id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Mark post as publishing
  await supabase
    .from("social_posts")
    .update({ status: "publishing" })
    .eq("id", post_id);

  // Get targets with their social accounts
  const { data: targets } = await supabase
    .from("social_post_targets")
    .select("*, social_accounts(*)")
    .eq("post_id", post_id);

  if (!targets?.length) {
    return NextResponse.json({ error: "No target platforms" }, { status: 400 });
  }

  const results = [];
  let allSucceeded = true;

  for (const target of targets) {
    const account = target.social_accounts;
    try {
      // Mark target as publishing
      await supabase
        .from("social_post_targets")
        .update({ status: "publishing" })
        .eq("id", target.id);

      const result = await publishPost(
        account.platform,
        account.access_token,
        account.platform_page_id,
        post.content,
        post.media_urls?.length > 0 ? post.media_urls : undefined
      );

      if (result.error) {
        throw new Error(result.error.message ?? JSON.stringify(result.error));
      }

      // Extract the platform post ID
      const platformPostId = result.id ?? result.name ?? null;

      await supabase
        .from("social_post_targets")
        .update({
          status: "published",
          platform_post_id: platformPostId,
          published_at: new Date().toISOString(),
        })
        .eq("id", target.id);

      results.push({ platform: account.platform, success: true, platformPostId });
    } catch (err) {
      allSucceeded = false;
      const errorMsg = (err as Error).message;
      await supabase
        .from("social_post_targets")
        .update({ status: "failed", error_message: errorMsg })
        .eq("id", target.id);

      results.push({ platform: account.platform, success: false, error: errorMsg });
    }
  }

  // Update post status
  await supabase
    .from("social_posts")
    .update({
      status: allSucceeded ? "published" : "failed",
      published_at: allSucceeded ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", post_id);

  return NextResponse.json({ results, allSucceeded });
}
