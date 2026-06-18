const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function readBlobJson(token, pathname, fallback) {
  const res = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) return fallback;
  return res.json();
}

async function main() {
  loadEnvFile(path.join(__dirname, "..", ".env.local"));

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!url || !key) {
    throw new Error("Supabase env vars missing");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (blobToken) {
    const bookings = await readBlobJson(blobToken, "salon/bookings.json", []);
    const blockedDays = await readBlobJson(
      blobToken,
      "salon/blocked-days.json",
      [],
    );

    if (bookings.length > 0) {
      const rows = bookings.map((b) => ({
        id: b.id,
        date: b.date,
        time: b.time,
        service_id: b.serviceId,
        duration_minutes: b.durationMinutes,
        balayage_options: b.balayageOptions ?? null,
        client_name: b.clientName,
        client_phone: b.clientPhone,
        client_email: b.clientEmail ?? "",
        created_at: b.createdAt,
      }));

      const { error } = await supabase.from("bookings").upsert(rows);
      if (error) throw error;
      console.log(`Migrated ${rows.length} bookings from blob.`);
    } else {
      console.log("No blob bookings to migrate.");
    }

    if (blockedDays.length > 0) {
      const rows = blockedDays.map((d) => ({
        date: d.date,
        reason: d.reason ?? null,
        created_at: d.createdAt,
      }));

      const { error } = await supabase.from("blocked_days").upsert(rows);
      if (error) throw error;
      console.log(`Migrated ${rows.length} blocked days from blob.`);
    } else {
      console.log("No blob blocked days to migrate.");
    }
  }

  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });
  const { count: blockedCount } = await supabase
    .from("blocked_days")
    .select("*", { count: "exact", head: true });

  console.log(`Supabase now has ${bookingCount ?? 0} bookings.`);
  console.log(`Supabase now has ${blockedCount ?? 0} blocked days.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
