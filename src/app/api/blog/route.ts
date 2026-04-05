import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/blog — list blog posts for the current tenant
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  const statusFilter = req.nextUrl.searchParams.get("status");

  // If no user but tenant_id provided, serve public published posts
  if (!user && tenantId) {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image_url, meta_description, tags, author_name, published_at")
      .eq("tenant_id", tenantId)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts });
  }

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's tenant
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "No profile found" }, { status: 404 });

  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: posts, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts });
}

// POST /api/blog — create a new blog post
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "No profile found" }, { status: 404 });

  const body = await req.json();

  // Generate slug from title if not provided
  const slug = body.slug || body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert({
      tenant_id: profile.tenant_id,
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      body_html: body.body_html || "",
      body_markdown: body.body_markdown || "",
      featured_image_url: body.featured_image_url || null,
      meta_description: body.meta_description || null,
      tags: body.tags || [],
      status: body.status || "draft",
      author_name: body.author_name || user.email,
      social_post_id: body.social_post_id || null,
      published_at: body.status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post }, { status: 201 });
}

// PATCH /api/blog — update a blog post
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

  // If publishing, set published_at
  if (updates.status === "published" && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }

  updates.updated_at = new Date().toISOString();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post });
}
