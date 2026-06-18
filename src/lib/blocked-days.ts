import { promises as fs } from "fs";
import path from "path";
import {
  isBlobConfigured,
  readBlobBlockedDays,
  writeBlobBlockedDays,
} from "./blob-storage";
import { getDataDir } from "./data-dir";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase-server";

export type BlockedDay = {
  date: string;
  reason?: string;
  createdAt: string;
};

type BlockedDayRow = {
  date: string;
  reason: string | null;
  created_at: string;
};

const DATA_DIR = getDataDir();
const BLOCKED_FILE = path.join(DATA_DIR, "blocked-days.json");

function rowToBlockedDay(row: BlockedDayRow): BlockedDay {
  return {
    date: row.date,
    reason: row.reason ?? undefined,
    createdAt: row.created_at,
  };
}

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(BLOCKED_FILE);
  } catch {
    await fs.writeFile(BLOCKED_FILE, "[]", "utf-8");
  }
}

async function getAllFromFile(): Promise<BlockedDay[]> {
  await ensureDataFile();
  const raw = await fs.readFile(BLOCKED_FILE, "utf-8");
  return JSON.parse(raw) as BlockedDay[];
}

async function saveAllToFile(days: BlockedDay[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(BLOCKED_FILE, JSON.stringify(days, null, 2), "utf-8");
}

async function getAllFromStore(): Promise<BlockedDay[]> {
  if (isBlobConfigured()) {
    return readBlobBlockedDays<BlockedDay[]>([]);
  }
  return getAllFromFile();
}

async function saveAllToStore(days: BlockedDay[]): Promise<void> {
  if (isBlobConfigured()) {
    await writeBlobBlockedDays(days);
    return;
  }
  await saveAllToFile(days);
}

export async function getAllBlockedDays(): Promise<BlockedDay[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("blocked_days")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    return (data as BlockedDayRow[]).map(rowToBlockedDay);
  }

  const all = await getAllFromStore();
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getBlockedDateSet(): Promise<Set<string>> {
  const days = await getAllBlockedDays();
  return new Set(days.map((d) => d.date));
}

export async function isDateBlocked(date: string): Promise<boolean> {
  const blocked = await getBlockedDateSet();
  return blocked.has(date);
}

export async function blockDay(
  date: string,
  reason?: string,
): Promise<BlockedDay> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("blocked_days")
      .upsert({ date, reason: reason ?? null })
      .select("*")
      .single();

    if (error) throw error;
    return rowToBlockedDay(data as BlockedDayRow);
  }

  const all = await getAllFromStore();
  const existing = all.find((d) => d.date === date);
  if (existing) {
    existing.reason = reason;
    await saveAllToStore(all);
    return existing;
  }

  const day: BlockedDay = {
    date,
    reason,
    createdAt: new Date().toISOString(),
  };
  all.push(day);
  await saveAllToStore(all);
  return day;
}

export async function unblockDay(date: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const { error, count } = await getSupabaseAdmin()
      .from("blocked_days")
      .delete({ count: "exact" })
      .eq("date", date);

    if (error) throw error;
    return (count ?? 0) > 0;
  }

  const all = await getAllFromStore();
  const next = all.filter((d) => d.date !== date);
  if (next.length === all.length) return false;
  await saveAllToStore(next);
  return true;
}
