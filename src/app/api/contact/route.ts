import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, business, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Big Britches <noreply@bigbritches.io>",
      to: "team@bigbritches.io",
      replyTo: email,
      subject: `New inquiry from ${name}${business ? ` (${business})` : ""}`,
      html: `<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
${business ? `<p><strong>Business:</strong> ${business}</p>` : ""}
<hr />
<p>${message.replace(/\n/g, "<br />")}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
