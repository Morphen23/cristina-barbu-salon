import { promises as fs } from "fs";
import path from "path";
import type { BalayageOptions } from "./balayage";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase-server";

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

type BookingRow = {
  id: string;
  date: string;
  time: string;
  service_id: string;
  duration_minutes: number;
  balayage_options: BalayageOptions | null;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  created_at: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    serviceId: row.service_id,
    durationMinutes: row.duration_minutes,
    balayageOptions: row.balayage_options ?? undefined,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email ?? "",
    createdAt: row.created_at,
  };
}

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(BOOKINGS_FILE);
  } catch {
    await fs.writeFile(BOOKINGS_FILE, "[]", "utf-8");
  }
}

async function getAllBookingsFromFile(): Promise<Booking[]> {
  await ensureDataFile();
  const raw = await fs.readFile(BOOKINGS_FILE, "utf-8");
  return JSON.parse(raw) as Booking[];
}

async function saveAllBookingsToFile(bookings: Booking[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

export async function getAllBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) throw error;
    return (data as BookingRow[]).map(rowToBooking);
  }

  const all = await getAllBookingsFromFile();
  return all.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    return byDate !== 0 ? byDate : a.time.localeCompare(b.time);
  });
}

export async function getBookingsForDate(date: string): Promise<Booking[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .select("*")
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;
    return (data as BookingRow[]).map(rowToBooking);
  }

  const all = await getAllBookingsFromFile();
  return all.filter((b) => b.date === date);
}

export async function createBooking(
  data: Omit<Booking, "id" | "createdAt">,
): Promise<Booking> {
  if (isSupabaseConfigured()) {
    const { data: row, error } = await getSupabaseAdmin()
      .from("bookings")
      .insert({
        date: data.date,
        time: data.time,
        service_id: data.serviceId,
        duration_minutes: data.durationMinutes,
        balayage_options: data.balayageOptions ?? null,
        client_name: data.clientName,
        client_phone: data.clientPhone,
        client_email: data.clientEmail,
      })
      .select("*")
      .single();

    if (error) throw error;
    return rowToBooking(row as BookingRow);
  }

  const all = await getAllBookingsFromFile();
  const booking: Booking = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(booking);
  await saveAllBookingsToFile(all);
  return booking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const { error, count } = await getSupabaseAdmin()
      .from("bookings")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;
    return (count ?? 0) > 0;
  }

  const all = await getAllBookingsFromFile();
  const next = all.filter((b) => b.id !== id);
  if (next.length === all.length) return false;
  await saveAllBookingsToFile(next);
  return true;
}
