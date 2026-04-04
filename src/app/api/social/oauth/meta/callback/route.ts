import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleMetaCallback } from "@/lib/social/platforms";

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
    const result = await handleMetaCallback(code);
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get tenant_id from state
    const tenantId = state;

    // Upsert each Facebook page + its Instagram account
    for (const page of result.pages) {
      // Facebook page
      await supabase.from("social_accounts").upsert(
        {
          tenant_id: tenantId,
          platform: "facebook",
          access_token: page.access_token,
          token_expires_at: result.tokenExpiresAt,
          platform_user_id: page.platform_user_id,
          platform_page_id: page.platform_page_id,
          platform_page_name: page.platform_page_name,
          platform_page_avatar: page.platform_page_avatar,
          scopes: page.scopes,
          connected_by: user.id,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,platform,platform_page_id" }
      );

      // Instagram account (if linked)
      if (page.instagram) {
        await supabase.from("social_accounts").upsert(
          {
            tenant_id: tenantId,
            platform: "instagram",
            access_token: page.instagram.access_token,
            token_expires_at: result.tokenExpiresAt,
            platform_user_id: page.instagram.platform_user_id,
            platform_page_id: page.instagram.platform_page_id,
            platform_page_name: page.instagram.platform_page_name,
            platform_page_avatar: page.instagram.platform_page_avatar,
            scopes: page.instagram.scopes,
            connected_by: user.id,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tenant_id,platform,platform_page_id" }
        );
      }
    }

    return NextResponse.redirect(
      `${appUrl}/admin/social?tab=integrations&success=meta`
    );
  } catch (err) {
    console.error("Meta OAuth callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/admin/social?tab=integrations&error=${encodeURIComponent(
        (err as Error).message
      )}`
    );
  }
}
