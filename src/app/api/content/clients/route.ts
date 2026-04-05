import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentClient } from "@/lib/content/types";

/**
 * GET /api/content/clients
 * List all content clients
 */
export async function GET() {
  try {
    const supabase = getAdminClient();

    const { data: clients, error } = await supabase
      .from("content_clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ clients: clients as ContentClient[] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Get clients error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * POST /api/content/clients
 * Create a new content client
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();

    // Validate required fields
    const required = ["business_name", "industry", "website_url"];
    for (const field of required) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    const clientData = {
      business_name: body.business_name,
      industry: body.industry,
      target_audience: body.target_audience || "",
      brand_tone: body.brand_tone || "professional",
      website_url: body.website_url,
      platforms_enabled: body.platforms_enabled || {
        blog: true,
        facebook: false,
        instagram: false,
        google_business: false,
      },
      auto_approve: body.auto_approve || false,
      notification_email: body.notification_email || "",
      active: true,
    };

    const { data: client, error } = await supabase
      .from("content_clients")
      .insert([clientData])
      .select()
      .single();

    if (error || !client) {
      throw new Error(`Failed to create client: ${error?.message}`);
    }

    return new Response(
      JSON.stringify({ client: client as ContentClient }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Create client error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
