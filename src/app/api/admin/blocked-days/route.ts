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

  try {
    const blockedDays = await getAllBlockedDays();
    return NextResponse.json({ blockedDays });
  } catch (error) {
    console.error("blocked-days GET:", error);
    return NextResponse.json(
      { error: "Nu s-au putut încărca zilele blocate." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const date = typeof body.date === "string" ? body.date : "";
    const reason =
      typeof body.reason === "string" ? body.reason.trim() : undefined;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Dată invalidă." }, { status: 400 });
    }

    const blockedDay = await blockDay(date, reason || undefined);
    return NextResponse.json({ blockedDay }, { status: 201 });
  } catch (error) {
    console.error("blocked-days POST:", error);
    return NextResponse.json(
      { error: "Nu s-a putut salva ziua blocată. Verifică baza de date Supabase." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  try {
    const date = request.nextUrl.searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "Dată lipsă." }, { status: 400 });
    }

    const removed = await unblockDay(date);
    if (!removed) {
      return NextResponse.json({ error: "Ziua nu era blocată." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("blocked-days DELETE:", error);
    return NextResponse.json(
      { error: "Nu s-a putut debloca ziua." },
      { status: 500 },
    );
  }
}
