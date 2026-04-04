import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMetaOAuthUrl, getGoogleOAuthUrl } from "@/lib/social/platforms";

// GET /api/social/accounts — list connected accounts for the tenant
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user profile to find tenant
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const { data: accounts, error } = await supabase
    .from("social_accounts")
    .select("id, platform, platform_page_id, platform_page_name, platform_page_avatar, is_active, connected_at, token_expires_at")
    .eq("tenant_id", profile.tenant_id)
    .order("platform", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accounts });
}

// POST /api/social/accounts/connect — initiate OAuth flow
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

  const { platform } = await req.json();
  const state = profile.tenant_id; // Pass tenant_id as OAuth state

  let redirectUrl: string;
  switch (platform) {
    case "facebook":
    case "instagram":
      // Meta OAuth covers both Facebook and Instagram
      redirectUrl = getMetaOAuthUrl(state);
      break;
    case "google_business":
      redirectUrl = getGoogleOAuthUrl(state);
      break;
    default:
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  }

  return NextResponse.json({ redirectUrl });
}

// DELETE /api/social/accounts — disconnect an account
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { accountId } = await req.json();

  const { error } = await supabase
    .from("social_accounts")
    .delete()
    .eq("id", accountId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
