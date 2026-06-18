import type { BalayageOptions } from "./balayage";
import { calculateBalayageDuration } from "./balayage";
import type { Booking } from "./bookings";
import { getServiceById } from "./config";

export function resolveBookingDuration(booking: Booking): number {
  if (booking.durationMinutes) return booking.durationMinutes;
  const service = getServiceById(booking.serviceId);
  return service?.durationMinutes ?? 60;
}

export function resolveServiceDuration(
  serviceId: string,
  balayageOptions?: BalayageOptions,
): number | null {
  if (serviceId === "balayage") {
    if (!balayageOptions) return null;
    return calculateBalayageDuration(balayageOptions);
  }
  const service = getServiceById(serviceId);
  return service?.durationMinutes ?? null;
}
