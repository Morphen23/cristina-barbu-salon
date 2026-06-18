import { get, head, put } from "@vercel/blob";

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function readJson<T>(pathname: string, fallback: T): Promise<T> {
  try {
    await head(pathname);
    const result = await get(pathname, { access: "private" });
    if (!result?.stream) return fallback;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(pathname: string, data: T): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export const blobPaths = {
  bookings: "salon/bookings.json",
  blockedDays: "salon/blocked-days.json",
} as const;

export async function readBlobBookings<T>(fallback: T): Promise<T> {
  return readJson(blobPaths.bookings, fallback);
}

export async function writeBlobBookings<T>(data: T): Promise<void> {
  await writeJson(blobPaths.bookings, data);
}

export async function readBlobBlockedDays<T>(fallback: T): Promise<T> {
  return readJson(blobPaths.blockedDays, fallback);
}

export async function writeBlobBlockedDays<T>(data: T): Promise<void> {
  await writeJson(blobPaths.blockedDays, data);
}
