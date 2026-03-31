import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const business = formData.get("business") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Process file attachments
    const fileEntries = formData.getAll("files") as File[];
    const attachments = await Promise.all(
      fileEntries
        .filter((file) => file.size > 0)
        .map(async (file) => ({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
        }))
    );

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
<p>${message.replace(/\n/g, "<br />")}</p>
${attachments.length > 0 ? `<hr /><p><strong>Attachments:</strong> ${attachments.length} file${attachments.length > 1 ? "s" : ""} attached</p>` : ""}`,
      ...(attachments.length > 0 ? { attachments } : {}),
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
