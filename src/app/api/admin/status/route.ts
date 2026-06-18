import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isBlobConfigured } from "@/lib/blob-storage";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const database = isSupabaseConfigured()
    ? "supabase"
    : isBlobConfigured()
      ? "blob"
      : "local";

  return NextResponse.json({
    database,
    emailConfigured: !!(process.env.RESEND_API_KEY && process.env.SALON_NOTIFY_EMAIL),
  });
}
