import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

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

    // Upload files to Supabase Storage and generate signed URLs
    const fileEntries = formData.getAll("files") as File[];
    const validFiles = fileEntries.filter((f) => f.size > 0);
    const uploadedFiles: { name: string; url: string; size: string }[] = [];

    if (validFiles.length > 0) {
      const supabase = getAdminClient();
      const timestamp = Date.now();
      const folder = `${timestamp}-${name.replace(/[^a-zA-Z0-9]/g, "_")}`;

      for (const file of validFiles) {
        const filePath = `${folder}/${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from("contact-attachments")
          .upload(filePath, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        // Generate a signed URL valid for 30 days
        const { data: signedData } = await supabase.storage
          .from("contact-attachments")
          .createSignedUrl(filePath, 60 * 60 * 24 * 30);

        const size = file.size < 1024 * 1024
          ? (file.size / 1024).toFixed(1) + " KB"
          : (file.size / (1024 * 1024)).toFixed(1) + " MB";

        if (signedData?.signedUrl) {
          uploadedFiles.push({
            name: file.name,
            url: signedData.signedUrl,
            size,
          });
        }
      }
    }

    // Build attachment links HTML
    const attachmentHtml = uploadedFiles.length > 0
      ? `<hr />
<h3>Attachments (${uploadedFiles.length})</h3>
<ul>${uploadedFiles.map((f) => `<li><a href="${f.url}">${f.name}</a> (${f.size}) — link valid for 30 days</li>`).join("")}</ul>`
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
