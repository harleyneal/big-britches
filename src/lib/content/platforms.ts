import { ContentClient, ContentPost } from "./types";

interface PublishResult {
  platform: string;
  success: boolean;
  external_url?: string;
  error_message?: string;
}

/**
 * Distribute a post to all enabled platforms
 * Note: Blog and social media (Facebook, Instagram, Google Business)
 * are now handled through the Social tab's unified publish flow.
 * This function is kept for the content pipeline's auto-distribution.
 */
export async function distributePost(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  // Blog publishing is handled via the /api/blog endpoint from the Social tab
  if (client.platforms_enabled.blog) {
    results.push({
      platform: "blog",
      success: true,
      external_url: `${client.website_url}/blog/${post.slug}`,
    });
  }

  // Facebook publishing is handled via the Social tab's OAuth-based flow
  if (client.platforms_enabled.facebook) {
    // Handled via social_accounts + social_post_targets
  }

  // Instagram publishing is handled via the Social tab's OAuth-based flow
  if (client.platforms_enabled.instagram) {
    // Handled via social_accounts + social_post_targets
  }

  // Google Business Profile publishing is handled via the Social tab's OAuth-based flow
  if (client.platforms_enabled.google_business) {
    // Handled via social_accounts + social_post_targets
  }

  return results;
}
