export type UserRole = "super_admin" | "admin" | "client" | "viewer";

export interface UserProfile {
  id: string;
  tenant_id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  logo_url: string | null;
  primary_color: string;
  plan: "startup" | "business";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  settings: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
  tenant: Tenant;
}
