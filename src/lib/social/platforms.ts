/**
 * Social media platform integration helpers.
 *
 * Each platform exposes:
 *  - getOAuthUrl()   → redirect URL to start the OAuth flow
 *  - handleCallback() → exchange code for tokens, return account info
 *  - publishPost()   → push a post to the platform
 */

// ─── Meta (Facebook + Instagram) ─────────────────────────────────────────────

const META_APP_ID = process.env.META_APP_ID ?? "";
const META_APP_SECRET = process.env.META_APP_SECRET ?? "";
const META_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/social/oauth/meta/callback`
  : "http://localhost:3000/api/social/oauth/meta/callback";

// Scopes needed: manage pages, publish to pages, manage IG
const META_SCOPES = [
  "pages_manage_posts",
  "pages_read_engagement",
  "pages_show_list",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
].join(",");

export function getMetaOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: META_REDIRECT_URI,
    scope: META_SCOPES,
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
}

export async function handleMetaCallback(code: string) {
  // Exchange code for short-lived token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: META_REDIRECT_URI,
        code,
      })
  );
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error.message);

  // Exchange for long-lived token (60-day)
  const longRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        fb_exchange_token: tokenData.access_token,
      })
  );
  const longData = await longRes.json();
  if (longData.error) throw new Error(longData.error.message);

  const userToken = longData.access_token;
  const expiresIn = longData.expires_in ?? 5184000; // default 60 days

  // Get user info
  const meRes = await fetch(
    `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${userToken}`
  );
  const me = await meRes.json();

  // Get pages the user manages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,picture&access_token=${userToken}`
  );
  const pagesData = await pagesRes.json();

  // Get Instagram Business Account for each page
  const pages = [];
  for (const page of pagesData.data ?? []) {
    // Get long-lived page token
    const pageTokenRes = await fetch(
      `https://graph.facebook.com/v21.0/${page.id}?fields=access_token,instagram_business_account{id,name,username,profile_picture_url}&access_token=${userToken}`
    );
    const pageTokenData = await pageTokenRes.json();

    pages.push({
      platform: "facebook" as const,
      platform_user_id: me.id,
      platform_page_id: page.id,
      platform_page_name: page.name,
      platform_page_avatar: page.picture?.data?.url ?? null,
      access_token: pageTokenData.access_token ?? page.access_token,
      scopes: META_SCOPES.split(","),
      // Attach Instagram info if available
      instagram: pageTokenData.instagram_business_account
        ? {
            platform: "instagram" as const,
            platform_user_id: me.id,
            platform_page_id: pageTokenData.instagram_business_account.id,
            platform_page_name:
              pageTokenData.instagram_business_account.username ??
              pageTokenData.instagram_business_account.name,
            platform_page_avatar:
              pageTokenData.instagram_business_account.profile_picture_url ?? null,
            access_token: pageTokenData.access_token ?? page.access_token, // IG uses page token
            scopes: META_SCOPES.split(","),
          }
        : null,
    });
  }

  return {
    userId: me.id,
    userName: me.name,
    userToken,
    tokenExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    pages,
  };
}

export async function publishToFacebook(
  pageAccessToken: string,
  pageId: string,
  content: string,
  mediaUrls?: string[]
) {
  // If there's an image, publish as photo post
  if (mediaUrls && mediaUrls.length > 0) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: mediaUrls[0],
          message: content,
          access_token: pageAccessToken,
        }),
      }
    );
    return res.json();
  }

  // Text-only post
  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: content,
      access_token: pageAccessToken,
    }),
  });
  return res.json();
}

export async function publishToInstagram(
  pageAccessToken: string,
  igAccountId: string,
  content: string,
  mediaUrls?: string[]
) {
  if (!mediaUrls || mediaUrls.length === 0) {
    // IG requires an image — can't do text-only posts via API
    throw new Error("Instagram requires at least one image to publish a post.");
  }

  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: mediaUrls[0],
        caption: content,
        access_token: pageAccessToken,
      }),
    }
  );
  const container = await containerRes.json();
  if (container.error) throw new Error(container.error.message);

  // Step 2: Publish the container
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: pageAccessToken,
      }),
    }
  );
  return publishRes.json();
}

// ─── Google Business Profile ─────────────────────────────────────────────────

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/social/oauth/google/callback`
  : "http://localhost:3000/api/social/oauth/google/callback";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
  "openid",
  "profile",
  "email",
].join(" ");

export function getGoogleOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    scope: GOOGLE_SCOPES,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function handleGoogleCallback(code: string) {
  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error_description ?? tokenData.error);

  const { access_token, refresh_token, expires_in } = tokenData;

  // Get user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const user = await userRes.json();

  // List business accounts
  const accountsRes = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  const accountsData = await accountsRes.json();

  // For each account, list locations
  const locations = [];
  for (const account of accountsData.accounts ?? []) {
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const locData = await locRes.json();
    for (const loc of locData.locations ?? []) {
      locations.push({
        platform: "google_business" as const,
        platform_user_id: user.id,
        platform_page_id: loc.name, // e.g. "locations/123456"
        platform_page_name: loc.title,
        platform_page_avatar: user.picture ?? null,
        access_token,
        refresh_token,
        token_expires_at: new Date(Date.now() + (expires_in ?? 3600) * 1000).toISOString(),
        scopes: GOOGLE_SCOPES.split(" "),
      });
    }
  }

  return {
    userId: user.id,
    userName: user.name,
    locations,
  };
}

export async function publishToGoogleBusiness(
  accessToken: string,
  locationName: string,
  content: string,
  mediaUrls?: string[]
) {
  const body: Record<string, unknown> = {
    languageCode: "en",
    summary: content,
    topicType: "STANDARD",
  };

  if (mediaUrls && mediaUrls.length > 0) {
    body.media = {
      mediaFormat: "PHOTO",
      sourceUrl: mediaUrls[0],
    };
  }

  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/localPosts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

// ─── Unified publish helper ──────────────────────────────────────────────────

export async function publishPost(
  platform: "facebook" | "instagram" | "google_business",
  accessToken: string,
  pageId: string,
  content: string,
  mediaUrls?: string[]
) {
  switch (platform) {
    case "facebook":
      return publishToFacebook(accessToken, pageId, content, mediaUrls);
    case "instagram":
      return publishToInstagram(accessToken, pageId, content, mediaUrls);
    case "google_business":
      return publishToGoogleBusiness(accessToken, pageId, content, mediaUrls);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
