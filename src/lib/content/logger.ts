import { getAdminClient } from "@/lib/supabase";
import { ContentLog } from "./types";

/**
 * Log a content action to the database
 */
export async function logAction(
  client_id: string,
  action: ContentLog["action"],
  details: string,
  post_id?: string,
  platform?: string
): Promise<void> {
  try {
    const supabase = getAdminClient();

    const log: Omit<ContentLog, "id"> = {
      client_id,
      post_id,
      action,
      platform,
      details,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from("content_logs").insert([log]);

    if (error) {
      console.error("Failed to log action:", error);
    }
  } catch (error) {
    console.error("Error logging action:", error);
  }
}

/**
 * Log multiple distribution results
 */
export async function logDistributions(
  post_id: string,
  results: Array<{ platform: string; success: boolean; error?: string }>
): Promise<void> {
  for (const result of results) {
    const details = result.success
      ? `Successfully published to ${result.platform}`
      : `Failed to publish to ${result.platform}: ${result.error || "Unknown error"}`;

    await logAction(
      "", // client_id would need to be fetched from post
      "distributed",
      details,
      post_id,
      result.platform
    );
  }
}
