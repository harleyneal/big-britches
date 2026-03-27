import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { ContentClient } from "@/lib/content/types";

/**
 * GET /api/content/clients/[id]
 * Get a single client by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id } = await params;

    const { data: client, error } = await supabase
      .from("content_clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !client) {
      return new Response(JSON.stringify({ error: "Client not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ client: client as ContentClient }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Get client error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * PATCH /api/content/clients/[id]
 * Update client configuration
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id } = await params;
    const updates = await req.json();

    const { data: updatedClient, error: updateError } = await supabase
      .from("content_clients")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedClient) {
      throw new Error(`Failed to update client: ${updateError?.message}`);
    }

    return new Response(
      JSON.stringify({ client: updatedClient as ContentClient }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Update client error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * DELETE /api/content/clients/[id]
 * Delete a client
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id } = await params;

    // Check if client has any posts
    const { data: posts, error: postsError } = await supabase
      .from("content_posts")
      .select("id", { count: "exact" })
      .eq("client_id", id);

    if (postsError) {
      throw new Error("Failed to check client posts");
    }

    if (posts && posts.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Cannot delete client with existing posts. Delete posts first.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete the client
    const { error: deleteError } = await supabase
      .from("content_clients")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete client: ${deleteError.message}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Delete client error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
