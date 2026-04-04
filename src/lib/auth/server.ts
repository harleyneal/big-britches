import { createClient } from "@/lib/supabase/server";
import type { AuthUser, UserProfile, Tenant } from "./types";

/**
 * Get the authenticated user with their profile and tenant data.
 * Use in Server Components and Route Handlers.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .single();

  if (!tenant) return null;

  return {
    id: user.id,
    email: user.email || "",
    profile: profile as UserProfile,
    tenant: tenant as Tenant,
  };
}
