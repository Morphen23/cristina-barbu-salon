import { NextResponse } from "next/server";
import { getBookableDatesAsync } from "@/lib/slots-server";
import { toDateKey } from "@/lib/slots";

export async function GET() {
  const dates = await getBookableDatesAsync();
  return NextResponse.json({
    dates: dates.map((date) => toDateKey(date)),
  });
}
