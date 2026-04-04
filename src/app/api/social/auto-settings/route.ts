import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/social/auto-settings
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const { data: settings } = await supabase
    .from("social_auto_settings")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .single();

  return NextResponse.json({ settings: settings ?? null });
}

// PUT /api/social/auto-settings
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const body = await req.json();

  const { data: settings, error } = await supabase
    .from("social_auto_settings")
    .upsert(
      {
        tenant_id: profile.tenant_id,
        enabled: body.enabled ?? false,
        auto_post_account_ids: body.auto_post_account_ids ?? [],
        business_type: body.business_type ?? "",
        content_topics: body.content_topics ?? [],
        tone: body.tone ?? "professional",
        require_approval: body.require_approval ?? true,
        post_days: body.post_days ?? [2, 5],
        post_time: body.post_time ?? "10:00",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings });
}
