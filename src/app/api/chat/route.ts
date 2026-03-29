import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

// Site content — auto-included so the bot knows the business
const SITE_CONTEXT = `
COMPANY: Big Britches LLC
WEBSITE: https://www.bigbritches.io
INDUSTRY: All-in-one website and business platform for small businesses

WHAT WE DO:
Big Britches builds custom websites paired with a powerful admin dashboard — scheduling, payments, order tracking, and AI tools — all under one simple subscription. We give small business big britches.

SERVICES:
- Custom Website Design (built from scratch, no templates, fully responsive)
- Admin Dashboard (manage your entire business from one clean interface)
- Online Scheduling & Booking (customers book directly from your site)
- Payments & Invoicing (powered by Stripe, built into your dashboard)
- Order & Job Tracking (simple workflow: New → In Progress → Complete → Paid)
- AI-Powered Tools (chatbot for customer inquiries, SEO assistant, content suggestions)

PRICING:
- The Big Britches Plan: $37/month ($300 one-time setup deposit) — Custom-designed responsive website, admin dashboard with analytics, online scheduling & automated reminders, Stripe payments & invoicing, e-commerce ready, AI chatbot trained on your content, AI-written blog posts published twice a week, SEO/sitemap/performance analytics, cloud hosting/maintenance/updates included
- One simple plan with everything included — no tiers, no hidden fees
- Need something custom? Just reach out and we'll work something out
- Typical turnaround: 1-3 weeks from consultation to launch

PROCESS:
1. Tell Us What You Need — Fill out a form or chat with us online
2. We Build It — We design your custom site and configure your dashboard (1-3 weeks)
3. You Run Your Business — Your site goes live; we handle hosting, maintenance, and updates

CONTACT: team@bigbritches.io
CONSULTATION: All consultations are done online — no phone calls required. Use the contact form or this chat.
`;

const SYSTEM_PROMPT = `You are the Big Britches virtual assistant. You help visitors learn about Big Britches' all-in-one website and business platform for small businesses.

Here is everything you know about the company:
${SITE_CONTEXT}
GUIDELINES:
- Be friendly, conversational, and helpful. Keep it real — talk like a smart human, not a corporate brochure. Keep responses to 2-3 sentences when possible.
- If someone asks about pricing, mention the $37/mo plan with $300 setup and suggest they fill out the contact form or keep chatting for more details.
- NEVER suggest a phone call or discovery call. All consultations are done online via chat or the contact form.
- If someone asks a question you cannot answer, direct them to email team@bigbritches.io or use the contact form.
- Never make up information. Only use what is provided above.
- You represent Big Britches — be professional but down-to-earth. A little personality goes a long way.
- If asked about competitors or other companies, stay neutral and redirect to Big Britches' strengths.
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

    const client = new Anthropic({ apiKey });
    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return new Response(JSON.stringify({ response: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const error = err as Record<string, unknown>;
    console.error("=== CHAT API ERROR ===");
    console.error("Error:", error?.message);
    console.error("Status:", error?.status);
    if (error?.error) {
      console.error("Body:", JSON.stringify(error.error));
    }

    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
