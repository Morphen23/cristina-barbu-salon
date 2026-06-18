import { NextRequest, NextResponse } from "next/server";
import {
  addMinutesToTime,
  formatDuration,
  type BalayageOptions,
  type HairLength,
  isBalayageOptionsComplete,
} from "@/lib/balayage";
import { getBookingsForDate } from "@/lib/bookings";
import { isDateBlocked } from "@/lib/blocked-days";
import { resolveBookingDuration, resolveServiceDuration } from "@/lib/duration";
import { getServiceById } from "@/lib/config";
import { generateSlotsForDate, parseDateKey } from "@/lib/slots";

function parseBalayageOptions(
  params: URLSearchParams,
): BalayageOptions | undefined {
  const hairLength = params.get("hairLength") as HairLength | null;
  const hairColor = params.get("hairColor");
  const wantsCut = params.get("wantsCut") === "true";
  const wantsStyling = params.get("wantsStyling") === "true";

  const partial = { hairLength: hairLength ?? undefined, hairColor: hairColor ?? undefined, wantsCut, wantsStyling };
  return isBalayageOptionsComplete(partial) ? partial : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const date = params.get("date");
  const serviceId = params.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: "Parametrii date și serviceId sunt obligatorii." },
      { status: 400 },
    );
  }

  const service = getServiceById(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Serviciu invalid." }, { status: 400 });
  }

  const balayageOptions =
    serviceId === "balayage" ? parseBalayageOptions(params) : undefined;

  if (serviceId === "balayage" && !balayageOptions) {
    return NextResponse.json(
      { error: "Completează detaliile pentru balayage." },
      { status: 400 },
    );
  }

  const durationMinutes = resolveServiceDuration(serviceId, balayageOptions);
  if (durationMinutes === null) {
    return NextResponse.json({ error: "Durată invalidă." }, { status: 400 });
  }

  if (await isDateBlocked(date)) {
    return NextResponse.json({
      slots: [],
      durationMinutes,
      durationLabel: formatDuration(durationMinutes),
      blocked: true,
    });
  }

  const bookings = await getBookingsForDate(date);
  const occupied = bookings.map((b) => ({
    start: b.time,
    durationMinutes: resolveBookingDuration(b),
  }));

  const slots = generateSlotsForDate(
    parseDateKey(date),
    durationMinutes,
    occupied,
  ).map((slot) => ({
    ...slot,
    endTime:
      slot.status === "available"
        ? addMinutesToTime(slot.time, durationMinutes)
        : undefined,
  }));

  return NextResponse.json({
    slots,
    durationMinutes,
    durationLabel: formatDuration(durationMinutes),
  });
}
