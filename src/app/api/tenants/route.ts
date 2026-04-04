import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/tenants — list all tenants (super_admin only)
export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser || authUser.profile.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*, user_profiles(count)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/tenants — create a new tenant (super_admin only)
export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.profile.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug, custom_domain, plan, primary_color } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .insert({
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      custom_domain: custom_domain || null,
      plan: plan || "startup",
      primary_color: primary_color || "#3B82F6",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
