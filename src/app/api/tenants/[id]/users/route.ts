import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/tenants/:id/users — list users for a tenant
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Super admins see any tenant's users, others only their own
  if (
    authUser.profile.role !== "super_admin" &&
    authUser.profile.tenant_id !== id
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("tenant_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
