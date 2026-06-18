import { NextResponse } from "next/server";
import { getBlockedDateSet } from "@/lib/blocked-days";
import { getBookableDates, toDateKey } from "@/lib/slots";

export async function GET() {
  const blocked = await getBlockedDateSet();
  const dates = getBookableDates().filter(
    (date) => !blocked.has(toDateKey(date)),
  );

  return NextResponse.json({
    dates: dates.map((date) => toDateKey(date)),
  });
}
