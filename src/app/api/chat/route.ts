import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

// Site content — auto-included so the bot knows the business
const SITE_CONTEXT = `
COMPANY: Snow Leopard Labs LLC
WEBSITE: https://www.snowleopardllc.io
INDUSTRY: Web design & development for small businesses

SERVICES:
- Custom Website Design (built from scratch, no templates)
- Web Applications (interactive tools, dashboards, portals)
- CRM Integration (customer management built into your site)
- E-Commerce (online stores with payment processing)
- SEO & Analytics (search optimization, traffic tracking)
- Social Media Integration (connect and manage social presence)
- AI-Powered Tools (chatbots, content suggestions, SEO assistant)

PRICING:
- Starter Plan: $29/month — Custom single-page website, mobile responsive, basic SEO, contact form, monthly content update
- Business Plan: $79-99/month — Multi-page custom site, CRM integration, e-commerce ready, advanced SEO & analytics, AI chatbot, social media integration, priority support
- All plans: Low deposit to get started, simple monthly subscription, no hidden fees
- Typical turnaround: 1-3 weeks from discovery call to launch

PROCESS:
1. Discovery Call — Learn about the business, goals, and brand identity
2. Design & Build — Craft a custom site with modern design and fast performance
3. Launch & Grow — Site goes live; Snow Leopard handles hosting, maintenance, and updates

CONTACT: harley@snowleopardllc.io
`;

const SYSTEM_PROMPT = `You are the Snow Leopard Labs virtual assistant. You help visitors learn about Snow Leopard Labs' web design and development services for small businesses.

Here is everything you know about the company:
${SITE_CONTEXT}
GUIDELINES:
- Be friendly, concise, and helpful. Keep responses to 2-3 sentences when possible.
- If someone asks about pricing, mention both tiers and suggest a discovery call for a custom quote.
- If someone asks a question you cannot answer, direct them to email info@snowleopardllc.io or use the contact form.
- Never make up information. Only use what is provided above.
- You represent Snow Leopard Labs — be professional but approachable.
- If asked about competitors or other companies, stay neutral and redirect to Snow Leopard's strengths.
- Do not discuss internal business details, costs, or margins.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not set in environment");
      return new Response(
        JSON.stringify({ error: "Chat service not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log key prefix for debugging (safe — only first 12 chars)
    console.log("API key starts with:", apiKey.substring(0, 12) + "...");
    console.log("API key length:", apiKey.length);

    const client = new Anthropic({ apiKey });

    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages:", JSON.stringify(body));
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Log exact request for debugging
    const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));
    console.log("Sending to Anthropic:", JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 512,
      messageCount: apiMessages.length,
      firstMessageRole: apiMessages[0]?.role,
    }));

    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    });

    // Extract text from response
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return new Response(JSON.stringify({ response: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    // Comprehensive error logging for Anthropic SDK errors
    const error = err as Record<string, unknown>;
    console.error("=== CHAT API ERROR START ===");
    console.error("Error type:", typeof err);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error status:", error?.status);
    // Try to get the response body from Anthropic errors
    if (error?.error) {
      console.error("Error body:", JSON.stringify(error.error));
    }
    if (error?.headers) {
      console.error("Error headers:", JSON.stringify(error.headers));
    }
    // Fallback: stringify everything we can
    try {
      console.error("Full error JSON:", JSON.stringify(err, null, 2));
    } catch {
      console.error("Error not JSON-serializable, toString:", String(err));
    }
    console.error("=== CHAT API ERROR END ===");

    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
