import { NextRequest, NextResponse } from "next/server";
import {
  type BalayageOptions,
  type HairLength,
  isBalayageOptionsComplete,
} from "@/lib/balayage";
import { createBooking, getBookingsForDate } from "@/lib/bookings";
import { isDateBlocked } from "@/lib/blocked-days";
import { resolveBookingDuration, resolveServiceDuration } from "@/lib/duration";
import { getServiceById } from "@/lib/config";
import { sendBookingNotification } from "@/lib/email";
import { generateSlotsForDate, parseDateKey } from "@/lib/slots";

function parseBalayageOptions(body: Record<string, unknown>): BalayageOptions | undefined {
  const partial: Partial<BalayageOptions> = {
    hairLength: body.hairLength as HairLength | undefined,
    hairColor: typeof body.hairColor === "string" ? body.hairColor : undefined,
    wantsCut: body.wantsCut === true,
    wantsStyling: body.wantsStyling === true,
  };
  return isBalayageOptionsComplete(partial) ? partial : undefined;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    date,
    time,
    serviceId,
    clientName,
    clientPhone,
    clientEmail,
  } = body;

  if (!date || !time || !serviceId || !clientName || !clientPhone) {
    return NextResponse.json(
      { error: "Completează toate câmpurile obligatorii." },
      { status: 400 },
    );
  }

  const service = getServiceById(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Serviciu invalid." }, { status: 400 });
  }

  const balayageOptions =
    serviceId === "balayage" ? parseBalayageOptions(body) : undefined;

  if (serviceId === "balayage" && !balayageOptions) {
    return NextResponse.json(
      { error: "Completează detaliile pentru balayage (lungime, culoare)." },
      { status: 400 },
    );
  }

  const durationMinutes = resolveServiceDuration(serviceId, balayageOptions);
  if (durationMinutes === null) {
    return NextResponse.json({ error: "Durată invalidă." }, { status: 400 });
  }

  if (await isDateBlocked(date)) {
    return NextResponse.json(
      { error: "Ziua selectată nu este disponibilă pentru rezervări." },
      { status: 409 },
    );
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
  );
  const slot = slots.find((s) => s.time === time);

  if (!slot || slot.status !== "available") {
    return NextResponse.json(
      { error: "Intervalul selectat nu mai este disponibil." },
      { status: 409 },
    );
  }

  const booking = await createBooking({
    date,
    time,
    serviceId,
    durationMinutes,
    balayageOptions,
    clientName: String(clientName).trim(),
    clientPhone: String(clientPhone).trim(),
    clientEmail: String(clientEmail || "").trim(),
  });

  void sendBookingNotification(booking);

  return NextResponse.json({ booking }, { status: 201 });
}
