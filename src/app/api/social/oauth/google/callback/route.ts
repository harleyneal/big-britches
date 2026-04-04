import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleGoogleCallback } from "@/lib/social/platforms";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state"); // contains tenant_id
  const error = req.nextUrl.searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code || !state) {
    return NextResponse.redirect(
      `${appUrl}/admin/social?tab=integrations&error=${encodeURIComponent(
        error ?? "Missing authorization code"
      )}`
    );
  }

  try {
    const result = await handleGoogleCallback(code);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const tenantId = state;

    for (const location of result.locations) {
      await supabase.from("social_accounts").upsert(
        {
          tenant_id: tenantId,
          platform: "google_business",
          access_token: location.access_token,
          refresh_token: location.refresh_token,
          token_expires_at: location.token_expires_at,
          platform_user_id: location.platform_user_id,
          platform_page_id: location.platform_page_id,
          platform_page_name: location.platform_page_name,
          platform_page_avatar: location.platform_page_avatar,
          scopes: location.scopes,
          connected_by: user.id,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,platform,platform_page_id" }
      );
    }

    return NextResponse.redirect(
      `${appUrl}/admin/social?tab=integrations&success=google`
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/admin/social?tab=integrations&error=${encodeURIComponent(
        (err as Error).message
      )}`
    );
  }
}
