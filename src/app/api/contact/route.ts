import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

interface UploadedFile {
  name: string;
  path: string;
  size: number;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, business, message, files } = await req.json() as {
      name: string;
      email: string;
      business: string;
      message: string;
      files?: UploadedFile[];
    };

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Generate signed download URLs for uploaded files
    const fileLinks: { name: string; url: string; size: string }[] = [];

    if (files && files.length > 0) {
      const supabase = getAdminClient();

      for (const file of files) {
        const { data: signedData } = await supabase.storage
          .from("contact-attachments")
          .createSignedUrl(file.path, 60 * 60 * 24 * 30); // 30 days

        const size = file.size < 1024 * 1024
          ? (file.size / 1024).toFixed(1) + " KB"
          : (file.size / (1024 * 1024)).toFixed(1) + " MB";

        if (signedData?.signedUrl) {
          fileLinks.push({ name: file.name, url: signedData.signedUrl, size });
        }
      }
    }

    // Build attachment links HTML
    const attachmentHtml = fileLinks.length > 0
      ? `<hr />
<h3>Attachments (${fileLinks.length})</h3>
<ul>${fileLinks.map((f) => `<li><a href="${f.url}">${f.name}</a> (${f.size}) — link valid for 30 days</li>`).join("")}</ul>`
      : "";

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
${attachmentHtml}`,
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
