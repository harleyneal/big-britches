import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/social/posts — list posts for the tenant
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status");
  const postType = req.nextUrl.searchParams.get("post_type");

  let query = supabase
    .from("social_posts")
    .select("*, social_post_targets(*, social_accounts(id, platform, platform_page_name))")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);
  if (postType) query = query.eq("post_type", postType);

  const { data: posts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts });
}

// POST /api/social/posts — create a new post (manual or draft)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const { content, media_urls, target_account_ids, post_type, scheduled_for } =
    await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (!target_account_ids?.length) {
    return NextResponse.json(
      { error: "Select at least one platform" },
      { status: 400 }
    );
  }

  // Create the post
  const { data: post, error: postError } = await supabase
    .from("social_posts")
    .insert({
      tenant_id: profile.tenant_id,
      content: content.trim(),
      media_urls: media_urls ?? [],
      post_type: post_type ?? "manual",
      status: scheduled_for ? "scheduled" : "draft",
      scheduled_for: scheduled_for ?? null,
      created_by: user.id,
    })
    .select()
    .single();

  if (postError) return NextResponse.json({ error: postError.message }, { status: 500 });

  // Create target entries
  const targets = target_account_ids.map((accountId: string) => ({
    post_id: post.id,
    social_account_id: accountId,
  }));

  const { error: targetError } = await supabase
    .from("social_post_targets")
    .insert(targets);

  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 500 });
  }

  return NextResponse.json({ post });
}

// PATCH /api/social/posts — update post (approve, reject, edit)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { post_id, action, content, rejection_reason } = await req.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  switch (action) {
    case "approve":
      updates.status = "approved";
      updates.approved_by = user.id;
      updates.approved_at = new Date().toISOString();
      break;
    case "reject":
      updates.status = "rejected";
      updates.rejection_reason = rejection_reason ?? "";
      break;
    case "edit":
      if (content) updates.content = content;
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data: post, error } = await supabase
    .from("social_posts")
    .update(updates)
    .eq("id", post_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post });
}
