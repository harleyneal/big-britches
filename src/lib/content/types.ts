export interface ContentClient {
  id: string;
  business_name: string;
  industry: string;
  target_audience: string;
  brand_tone: string;
  website_url: string;
  platforms_enabled: {
    blog: boolean;
    facebook: boolean;
    instagram: boolean;
    google_business: boolean;
  };
  auto_approve: boolean;
  notification_email: string;
  payment_config?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContentPost {
  id: string;
  client_id: string;
  status: "draft" | "pending_approval" | "approved" | "published" | "rejected";
  topic: string;
  title: string;
  slug: string;
  meta_description: string;
  body_html: string;
  body_markdown: string;
  cta_text: string;
  cta_url: string;
  original_url?: string;
  linkedin_version: string;
  medium_version: string;
  gbp_version: string;
  generated_at: string;
  approved_at?: string;
  published_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentDistribution {
  id: string;
  post_id: string;
  platform: "blog" | "facebook" | "instagram" | "google_business";
  status: "pending" | "published" | "failed";
  external_url?: string;
  error_message?: string;
  published_at?: string;
  created_at: string;
}

export interface ContentLog {
  id: string;
  client_id: string;
  post_id?: string;
  action: "generated" | "approved" | "rejected" | "published" | "distributed" | "error";
  platform?: string;
  details: string;
  timestamp: string;
}
