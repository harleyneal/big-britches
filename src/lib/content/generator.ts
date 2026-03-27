import Anthropic from "@anthropic-ai/sdk";
import { ContentClient } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedContent {
  topic: string;
  title: string;
  slug: string;
  meta_description: string;
  body_html: string;
  body_markdown: string;
  cta_text: string;
  linkedin_version: string;
  medium_version: string;
  gbp_version: string;
}

/**
 * Convert markdown to basic HTML
 * This is a simple converter for blog post content
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Line breaks and paragraphs
  const paragraphs = html
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => {
      if (p.startsWith("<h") || p.startsWith("<ul") || p.startsWith("<ol")) {
        return p;
      }
      return `<p>${p}</p>`;
    });

  html = paragraphs.join("\n");

  // Lists
  html = html.replace(/^\* (.*?)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/, "<ul>$1</ul>");
  html = html.replace(/<\/li>\n<ul>/g, "");
  html = html.replace(/<\/ul>\n<ul>/g, "");

  return html;
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract JSON from a response that may contain markdown code blocks
 */
function extractJson(text: string): Record<string, unknown> {
  // Try to find JSON in code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})\s*```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }

  // Try to parse the entire response as JSON
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON object manually
    const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not extract JSON from response");
  }
}

/**
 * Step 1: Find a trending topic using web search
 */
async function findTrendingTopic(contentClient: ContentClient): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 1024,
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 3 } as any,
    ],
    messages: [
      {
        role: "user",
        content: `Find a trending topic in the ${contentClient.industry} industry that would be good for SEO-optimized blog content targeting ${contentClient.target_audience}.

The topic should be:
- Currently trending or seasonally relevant
- Valuable for our target audience
- Suitable for a ${contentClient.brand_tone} tone of voice
- Suitable for publishing on LinkedIn, Medium, and Google Business Profile

Return ONLY the topic name as a single sentence, nothing else.`,
      },
    ],
  });

  // Extract the topic from the response
  let topic = "";
  for (const block of response.content) {
    if (block.type === "text") {
      topic = block.text.trim();
    }
  }

  if (!topic) {
    throw new Error("Failed to generate trending topic");
  }

  return topic;
}

/**
 * Step 2: Generate full SEO-optimized blog post
 */
async function generateBlogPost(
  contentClient: ContentClient,
  topic: string
): Promise<{
  title: string;
  slug: string;
  meta_description: string;
  body_markdown: string;
  cta_text: string;
}> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `Create an SEO-optimized blog post for ${contentClient.business_name}.

Company: ${contentClient.business_name}
Industry: ${contentClient.industry}
Target Audience: ${contentClient.target_audience}
Brand Tone: ${contentClient.brand_tone}
Topic: ${topic}

Write a comprehensive, SEO-friendly blog post (800-1200 words) that:
1. Has an engaging, keyword-rich title
2. Includes a clear meta description (155-160 chars)
3. Uses proper heading hierarchy (H1, H2, H3)
4. Naturally incorporates the topic keywords
5. Provides genuine value to ${contentClient.target_audience}
6. Includes relevant internal linking suggestions [like this]
7. Ends with a clear call-to-action

Return the response as JSON with these exact fields:
{
  "title": "Title of the blog post",
  "meta_description": "155-160 character meta description",
  "body": "Full blog post in markdown format",
  "cta_text": "Clear call-to-action text"
}`,
      },
    ],
  });

  let content = "";
  for (const block of response.content) {
    if (block.type === "text") {
      content += block.text;
    }
  }

  const parsed = extractJson(content);

  return {
    title: String(parsed.title || ""),
    slug: generateSlug(String(parsed.title || "")),
    meta_description: String(parsed.meta_description || ""),
    body_markdown: String(parsed.body || ""),
    cta_text: String(parsed.cta_text || ""),
  };
}

/**
 * Step 3: Create platform-specific versions
 */
async function generatePlatformVersions(
  contentClient: ContentClient,
  title: string,
  body_markdown: string,
  cta_text: string
): Promise<{
  linkedin_version: string;
  medium_version: string;
  gbp_version: string;
}> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Create platform-specific versions of this blog post content for ${contentClient.business_name}.

Original Title: ${title}
Original CTA: ${cta_text}
Brand Tone: ${contentClient.brand_tone}

Create three versions in JSON format:

1. LinkedIn Post (200-300 words): Professional, engaging, suitable for LinkedIn audience. Should reference the full article.
2. Medium Article (500-700 words): Full article format with intro, key insights, and conclusion. Link back to original article.
3. Google Business Profile Post (100-150 words): Short, benefit-focused update suitable for local business profile. Include link to article.

Return as JSON:
{
  "linkedin": "LinkedIn version content",
  "medium": "Medium version content",
  "gbp": "Google Business Profile version content"
}`,
      },
    ],
  });

  let content = "";
  for (const block of response.content) {
    if (block.type === "text") {
      content += block.text;
    }
  }

  const parsed = extractJson(content);

  return {
    linkedin_version: String(parsed.linkedin || ""),
    medium_version: String(parsed.medium || ""),
    gbp_version: String(parsed.gbp || ""),
  };
}

/**
 * Main function: Generate complete content for a client
 */
export async function generateContent(
  contentClient: ContentClient
): Promise<GeneratedContent> {
  try {
    // Step 1: Find a trending topic
    const topic = await findTrendingTopic(contentClient);

    // Step 2: Generate full blog post
    const blogPost = await generateBlogPost(contentClient, topic);

    // Step 3: Generate platform-specific versions
    const platformVersions = await generatePlatformVersions(
      contentClient,
      blogPost.title,
      blogPost.body_markdown,
      blogPost.cta_text
    );

    // Convert markdown to HTML for storage
    const body_html = markdownToHtml(blogPost.body_markdown);

    return {
      topic,
      title: blogPost.title,
      slug: blogPost.slug,
      meta_description: blogPost.meta_description,
      body_html,
      body_markdown: blogPost.body_markdown,
      cta_text: blogPost.cta_text,
      linkedin_version: platformVersions.linkedin_version,
      medium_version: platformVersions.medium_version,
      gbp_version: platformVersions.gbp_version,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Content generation failed: ${message}`);
  }
}
