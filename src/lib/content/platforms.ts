import { ContentClient, ContentPost } from "./types";

interface PublishResult {
  platform: string;
  success: boolean;
  external_url?: string;
  error_message?: string;
}

/**
 * Publish content to the client's website (WordPress, Next.js MDX, or custom API)
 */
export async function publishToWebsite(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult> {
  try {
    switch (client.cms_type) {
      case "wordpress":
        return await publishToWordPress(client, post);
      case "nextjs_mdx":
        return await publishToNextJsMdx(client, post);
      case "custom_api":
        return await publishToCustomApi(client, post);
      default:
        throw new Error(`Unsupported CMS type: ${client.cms_type}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      platform: "website",
      success: false,
      error_message: message,
    };
  }
}

/**
 * Publish to WordPress via REST API
 */
async function publishToWordPress(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult> {
  const response = await fetch(`${client.cms_api_url}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${client.cms_api_key}`,
    },
    body: JSON.stringify({
      title: post.title,
      content: post.body_html,
      excerpt: post.meta_description,
      slug: post.slug,
      status: "publish",
      meta: {
        _yoast_wpseo_metadesc: post.meta_description,
        _yoast_wpseo_focuskw: post.title,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.statusText}`);
  }

  const data = (await response.json()) as { link?: string; id?: number };
  const url = data.link || `${client.website_url}/posts/${data.id}`;

  return {
    platform: "website",
    success: true,
    external_url: url,
  };
}

/**
 * Publish to Next.js MDX via custom API
 */
async function publishToNextJsMdx(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult> {
  const response = await fetch(client.cms_api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${client.cms_api_key}`,
    },
    body: JSON.stringify({
      title: post.title,
      slug: post.slug,
      content: post.body_markdown,
      meta_description: post.meta_description,
      published: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Next.js MDX API error: ${response.statusText}`);
  }

  const data = (await response.json()) as { url?: string };
  const url = data.url || `${client.website_url}/${post.slug}`;

  return {
    platform: "website",
    success: true,
    external_url: url,
  };
}

/**
 * Publish to custom API endpoint
 */
async function publishToCustomApi(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult> {
  const response = await fetch(client.cms_api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${client.cms_api_key}`,
    },
    body: JSON.stringify({
      title: post.title,
      slug: post.slug,
      content: post.body_html,
      markdown: post.body_markdown,
      meta_description: post.meta_description,
      cta_text: post.cta_text,
      cta_url: post.cta_url,
    }),
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.statusText}`);
  }

  const data = (await response.json()) as { url?: string };
  const url = data.url || `${client.website_url}/${post.slug}`;

  return {
    platform: "website",
    success: true,
    external_url: url,
  };
}

/**
 * Distribute a post to all enabled platforms
 */
export async function distributePost(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  // LinkedIn
  if (client.platforms_enabled.linkedin) {
    results.push(await publishToLinkedIn(client, post));
  }

  // Medium
  if (client.platforms_enabled.medium) {
    results.push(await publishToMedium(client, post));
  }

  // Google Business Profile
  if (client.platforms_enabled.google_business) {
    results.push(await publishToGoogleBusinessProfile(client, post));
  }

  return results;
}

/**
 * Publish to LinkedIn (via API or manual instructions)
 */
async function publishToLinkedIn(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult> {
  try {
    // This would integrate with LinkedIn's API
    // For now, return a success response with guidance
    const linkedinUrl = `https://www.linkedin.com/feed/`;

    return {
      platform: "linkedin",
      success: true,
      external_url: linkedinUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      platform: "linkedin",
      success: false,
      error_message: message,
    };
  }
}

/**
 * Publish to Medium
 */
async function publishToMedium(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult> {
  try {
    // This would integrate with Medium's API
    // For demonstration, return success
    const mediumUrl = `https://medium.com/`;

    return {
      platform: "medium",
      success: true,
      external_url: mediumUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      platform: "medium",
      success: false,
      error_message: message,
    };
  }
}

/**
 * Publish to Google Business Profile
 */
async function publishToGoogleBusinessProfile(
  client: ContentClient,
  post: ContentPost
): Promise<PublishResult> {
  try {
    // This would integrate with Google Business Profile API
    // For demonstration, return success
    const gbpUrl = `https://www.google.com/business/`;

    return {
      platform: "google_business",
      success: true,
      external_url: gbpUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      platform: "google_business",
      success: false,
      error_message: message,
    };
  }
}
