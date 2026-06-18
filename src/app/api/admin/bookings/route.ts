import { NextRequest, NextResponse } from "next/server";
import { deleteBooking, getAllBookings } from "@/lib/bookings";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const bookings = await getAllBookings();
  return NextResponse.json({ bookings });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID lipsă." }, { status: 400 });
  }

  const removed = await deleteBooking(id);
  if (!removed) {
    return NextResponse.json({ error: "Rezervare negăsită." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
