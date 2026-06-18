import { NextRequest, NextResponse } from "next/server";
import {
  blockDay,
  getAllBlockedDays,
  unblockDay,
} from "@/lib/blocked-days";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const blockedDays = await getAllBlockedDays();
  return NextResponse.json({ blockedDays });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const body = await request.json();
  const date = typeof body.date === "string" ? body.date : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Dată invalidă." }, { status: 400 });
  }

  const blockedDay = await blockDay(date, reason || undefined);
  return NextResponse.json({ blockedDay }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Dată lipsă." }, { status: 400 });
  }

  const removed = await unblockDay(date);
  if (!removed) {
    return NextResponse.json({ error: "Ziua nu era blocată." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
