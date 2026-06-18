"use client";

import { formatDuration, hairLengthLabels } from "@/lib/balayage";
import type { Booking } from "@/lib/bookings";
import type { BlockedDay } from "@/lib/blocked-days";
import { getServiceById } from "@/lib/config";
import { getBookableDates, toDateKey } from "@/lib/slots";
import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "bookings" | "calendar";

const RO_MONTHS = [
  "Ian", "Feb", "Mar", "Apr", "Mai", "Iun",
  "Iul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatBookingDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const days = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
  return `${days[date.getDay()]} ${d} ${RO_MONTHS[m - 1]} ${y}`;
}

function groupBookingsByDate(bookings: Booking[]): Map<string, Booking[]> {
  const map = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const list = map.get(booking.date) ?? [];
    list.push(booking);
    map.set(booking.date, list);
  }
  return map;
}

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [selectedBlockDate, setSelectedBlockDate] = useState<string | null>(null);

  const blockedSet = useMemo(
    () => new Set(blockedDays.map((d) => d.date)),
    [blockedDays],
  );

  const calendarDates = useMemo(() => getBookableDates(), []);

  const grouped = useMemo(() => groupBookingsByDate(bookings), [bookings]);

  const upcomingBookings = useMemo(() => {
    const today = toDateKey(new Date());
    return bookings.filter((b) => b.date >= today);
  }, [bookings]);

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/admin/session");
    const data = await res.json();
    setAuthenticated(data.authenticated === true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [bookingsRes, blockedRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/blocked-days"),
      ]);

      if (bookingsRes.status === 401 || blockedRes.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!bookingsRes.ok || !blockedRes.ok) {
        throw new Error("Nu s-au putut încărca datele.");
      }

      const bookingsData = await bookingsRes.json();
      const blockedData = await blockedRes.json();
      setBookings(bookingsData.bookings ?? []);
      setBlockedDays(blockedData.blockedDays ?? []);
    } catch {
      setActionError("Eroare la încărcarea datelor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (authenticated) void loadData();
  }, [authenticated, loadData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);

    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoggingIn(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoginError(
        typeof data.error === "string"
          ? data.error
          : "Utilizator sau parolă incorectă.",
      );
      return;
    }

    setUsername("");
    setPassword("");
    setAuthenticated(true);
  }

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setBookings([]);
    setBlockedDays([]);
  }

  async function handleDeleteBooking(id: string, clientName: string) {
    if (!confirm(`Anulezi rezervarea pentru ${clientName}?`)) return;

    const res = await fetch(`/api/admin/bookings?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setActionError("Nu s-a putut anula rezervarea.");
      return;
    }

    setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  async function toggleBlockedDay(dateKey: string) {
    setActionError(null);

    if (blockedSet.has(dateKey)) {
      const res = await fetch(
        `/api/admin/blocked-days?date=${encodeURIComponent(dateKey)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        setActionError("Nu s-a putut debloca ziua.");
        return;
      }
      setBlockedDays((prev) => prev.filter((d) => d.date !== dateKey));
      setSelectedBlockDate(null);
      return;
    }

    setSelectedBlockDate(dateKey);
  }

  async function confirmBlockDay() {
    if (!selectedBlockDate) return;

    const res = await fetch("/api/admin/blocked-days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedBlockDate,
        reason: blockReason.trim() || undefined,
      }),
    });

    if (!res.ok) {
      setActionError("Nu s-a putut bloca ziua.");
      return;
    }

    const data = await res.json();
    setBlockedDays((prev) => {
      const next = prev.filter((d) => d.date !== selectedBlockDate);
      next.push(data.blockedDay);
      return next.sort((a, b) => a.date.localeCompare(b.date));
    });
    setSelectedBlockDate(null);
    setBlockReason("");
  }

  if (authenticated === null) {
    return (
      <div className="flex min-h-full items-center justify-center px-5">
        <p className="text-sm text-muted">Se verifică sesiunea...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5 py-12">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-accent">
          Administrare
        </p>
        <h1 className="mt-4 font-display text-3xl text-foreground">
          Color & Balayage
        </h1>
        <p className="mt-3 text-sm text-muted">
          Autentifică-te pentru a vedea rezervările și a gestiona calendarul.
        </p>

        <form onSubmit={handleLogin} className="mt-10 space-y-4">
          <div>
            <label htmlFor="admin-username" className="mb-2 block text-[0.65rem] uppercase tracking-[0.18em] text-muted">
              Utilizator
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cristina.barbu"
              className="w-full border border-border-strong bg-background px-4 py-3 text-foreground"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-[0.65rem] uppercase tracking-[0.18em] text-muted">
              Parolă
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolă administrare"
              className="w-full border border-border-strong bg-background px-4 py-3 text-foreground"
              required
            />
          </div>
          {loginError && (
            <p className="text-sm text-red-700">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loggingIn}
            className="btn-premium w-full border border-foreground bg-foreground py-3 text-[0.65rem] uppercase tracking-[0.2em] text-background disabled:opacity-60"
          >
            {loggingIn ? "Se conectează..." : "Intră în panou"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-accent">
            Panou administrare
          </p>
          <h1 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
            Rezervări & calendar
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="border border-border-strong px-4 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted"
        >
          Deconectare
        </button>
      </div>

      <div className="mt-6 flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("bookings")}
          className={`px-4 py-3 text-sm ${
            tab === "bookings"
              ? "border-b-2 border-foreground font-medium text-foreground"
              : "text-muted"
          }`}
        >
          Rezervări ({upcomingBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("calendar")}
          className={`px-4 py-3 text-sm ${
            tab === "calendar"
              ? "border-b-2 border-foreground font-medium text-foreground"
              : "text-muted"
          }`}
        >
          Zile blocate ({blockedDays.length})
        </button>
      </div>

      {actionError && (
        <p className="mt-4 text-sm text-red-700">{actionError}</p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-muted">Se încarcă...</p>
      ) : tab === "bookings" ? (
        <div className="mt-8 space-y-8">
          {bookings.length === 0 ? (
            <p className="text-sm text-muted">Nu există rezervări încă.</p>
          ) : (
            Array.from(grouped.entries()).map(([dateKey, dayBookings]) => (
              <section key={dateKey}>
                <h2 className="font-display text-xl text-foreground">
                  {formatBookingDate(dateKey)}
                </h2>
                <ul className="mt-4 space-y-3">
                  {dayBookings.map((booking) => {
                    const service = getServiceById(booking.serviceId);
                    return (
                      <li
                        key={booking.id}
                        className="border border-border p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">
                              {booking.clientName}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {booking.time} · {service?.name ?? booking.serviceId}{" "}
                              · {formatDuration(booking.durationMinutes)}
                            </p>
                            <p className="mt-2 text-sm">
                              <a
                                href={`tel:${booking.clientPhone}`}
                                className="text-foreground underline-offset-2 hover:underline"
                              >
                                {booking.clientPhone}
                              </a>
                              {booking.clientEmail && (
                                <span className="text-muted">
                                  {" "}
                                  · {booking.clientEmail}
                                </span>
                              )}
                            </p>
                            {booking.balayageOptions && (
                              <p className="mt-2 text-xs leading-relaxed text-muted">
                                {hairLengthLabels[booking.balayageOptions.hairLength]}
                                {" · "}
                                {booking.balayageOptions.hairColor}
                                {booking.balayageOptions.wantsCut && " · tuns"}
                                {booking.balayageOptions.wantsStyling && " · styling"}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteBooking(
                                booking.id,
                                booking.clientName,
                              )
                            }
                            className="shrink-0 border border-border-strong px-3 py-2 text-[0.6rem] uppercase tracking-[0.15em] text-muted"
                          >
                            Anulează
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-sm text-muted">
            Apasă pe o zi pentru a o bloca (concediu, liber). Zilele blocate
            nu apar clienților la rezervare.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {calendarDates.map((date) => {
              const key = toDateKey(date);
              const blocked = blockedSet.has(key);
              const hasBookings = grouped.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => void toggleBlockedDay(key)}
                  className={`min-h-[4.5rem] border px-2 py-3 text-left text-xs transition-colors ${
                    blocked
                      ? "border-foreground bg-foreground text-background"
                      : hasBookings
                        ? "border-accent bg-[rgba(196,167,125,0.12)] text-foreground"
                        : "border-border text-foreground"
                  }`}
                >
                  <span className="block font-medium">
                    {date.getDate()} {RO_MONTHS[date.getMonth()]}
                  </span>
                  <span className="mt-1 block opacity-70">
                    {blocked ? "Blocată" : hasBookings ? "Cu programări" : "Deschisă"}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedBlockDate && (
            <div className="mt-8 border border-border p-5">
              <p className="font-display text-lg text-foreground">
                Blochezi {formatBookingDate(selectedBlockDate)}?
              </p>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Motiv (opțional): concediu, training..."
                className="mt-4 w-full border border-border-strong bg-background px-4 py-3 text-sm"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void confirmBlockDay()}
                  className="border border-foreground bg-foreground px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.18em] text-background"
                >
                  Confirmă blocarea
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBlockDate(null);
                    setBlockReason("");
                  }}
                  className="border border-border-strong px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.18em] text-muted"
                >
                  Renunță
                </button>
              </div>
            </div>
          )}

          {blockedDays.length > 0 && (
            <ul className="mt-8 space-y-2 border-t border-border pt-6">
              {blockedDays.map((day) => (
                <li
                  key={day.date}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span>
                    {formatBookingDate(day.date)}
                    {day.reason ? ` — ${day.reason}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => void toggleBlockedDay(day.date)}
                    className="text-[0.65rem] uppercase tracking-[0.15em] text-muted underline-offset-2 hover:underline"
                  >
                    Deblochează
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
