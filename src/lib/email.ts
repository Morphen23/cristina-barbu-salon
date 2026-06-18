import { formatDuration, hairLengthLabels } from "./balayage";
import type { Booking } from "./bookings";
import { getServiceById, salon } from "./config";

function getNotifyEmail(): string | null {
  return process.env.SALON_NOTIFY_EMAIL || salon.email || null;
}

function formatBalayageDetails(booking: Booking): string {
  if (!booking.balayageOptions) return "";
  const o = booking.balayageOptions;
  const lines = [
    `Lungime: ${hairLengthLabels[o.hairLength]}`,
    `Culoare: ${o.hairColor}`,
    o.wantsCut ? "Include tuns" : null,
    o.wantsStyling ? "Include styling" : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export async function sendBookingNotification(
  booking: Booking,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = getNotifyEmail();

  if (!apiKey || !to) return;

  const service = getServiceById(booking.serviceId);
  const serviceName = service?.name ?? booking.serviceId;
  const balayage = formatBalayageDetails(booking);

  const text = [
    "Rezervare nouă — Color & Balayage",
    "",
    `Serviciu: ${serviceName}`,
    `Durată: ${formatDuration(booking.durationMinutes)}`,
    `Data: ${booking.date}`,
    `Ora: ${booking.time}`,
    "",
    `Clientă: ${booking.clientName}`,
    `Telefon: ${booking.clientPhone}`,
    booking.clientEmail ? `Email: ${booking.clientEmail}` : null,
    balayage ? `\nDetalii balayage:\n${balayage}` : null,
    "",
    `ID rezervare: ${booking.id}`,
  ]
    .filter(Boolean)
    .join("\n");

  const from = process.env.RESEND_FROM_EMAIL || "Rezervări Salon <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Rezervare nouă: ${booking.clientName} — ${booking.date} ${booking.time}`,
      text,
    }),
  });

  if (!res.ok) {
    console.error("Email notification failed:", await res.text());
  }
}
