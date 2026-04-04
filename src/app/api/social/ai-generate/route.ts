import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are a social media content creator for small businesses. Your job is to write engaging, professional social media posts.

GUIDELINES:
- Write in a friendly, professional tone
- Keep posts concise — ideal for Facebook, Instagram captions, and Google Business updates
- Include 2-3 relevant hashtags at the end
- If given a trending topic, tie it back to the business naturally
- Never use misleading claims or make promises
- Be authentic — avoid corporate jargon
- Posts should be 1-3 short paragraphs max
- Make the content shareable and engaging

Return ONLY the post content — no preamble, no explanation, no quotes around it.`;

// POST /api/social/ai-generate — generate a social media post using AI
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const { business_type, topic, tone } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  // Step 1: Generate a trending topic if none was provided
  let trendingTopic = topic || "";
  if (!topic) {
    const trendingRes = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system:
        "You are a trend researcher. Given a business type, suggest ONE specific trending topic or news angle that would be relevant and timely for a social media post. Be specific and current. Return ONLY the topic — no explanation.",
      messages: [
        {
          role: "user",
          content: `Business type: ${business_type || "small business"}. What's a good trending topic for a social media post this week?`,
        },
      ],
    });
    trendingTopic =
      trendingRes.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("") || "tips for small businesses";
  }

  // Step 2: Generate the post
  const postRes = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Write a social media post for a ${business_type || "small business"}.
Topic or content idea: ${trendingTopic}
Tone: ${tone || "professional"}
The post should work well on Facebook, Instagram, and Google Business.`,
      },
    ],
  });

  const postContent = postRes.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return NextResponse.json({
    content: postContent,
    trending_topic: trendingTopic,
  });
}
