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

CONTACT: info@snowleopardllc.io
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
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Chat service not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Use non-streaming for reliability
    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    // Extract text from response
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return new Response(JSON.stringify({ response: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
