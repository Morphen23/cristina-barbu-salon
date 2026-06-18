import { promises as fs } from "fs";
import path from "path";
import type { BalayageOptions } from "./balayage";

export type Booking = {
  id: string;
  date: string;
  time: string;
  serviceId: string;
  durationMinutes: number;
  balayageOptions?: BalayageOptions;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(BOOKINGS_FILE);
  } catch {
    await fs.writeFile(BOOKINGS_FILE, "[]", "utf-8");
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  await ensureDataFile();
  const raw = await fs.readFile(BOOKINGS_FILE, "utf-8");
  return JSON.parse(raw) as Booking[];
}

export async function getBookingsForDate(date: string): Promise<Booking[]> {
  const all = await getAllBookings();
  return all.filter((b) => b.date === date);
}

export async function createBooking(
  data: Omit<Booking, "id" | "createdAt">,
): Promise<Booking> {
  const all = await getAllBookings();
  const booking: Booking = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(booking);
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(all, null, 2), "utf-8");
  return booking;
}
