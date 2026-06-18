import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  return NextResponse.json({
    database: isSupabaseConfigured() ? "supabase" : "local",
    emailConfigured: !!(process.env.RESEND_API_KEY && process.env.SALON_NOTIFY_EMAIL),
  });
}
