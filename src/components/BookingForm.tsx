"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateBalayageDuration,
  formatDuration,
  hairColorOptions,
  hairLengthLabels,
  isBalayageOptionsComplete,
  type BalayageOptions,
  type HairLength,
} from "@/lib/balayage";
import { services, type Service } from "@/lib/config";
import { getBookableDates, toDateKey, type TimeSlot } from "@/lib/slots";

type SlotWithEnd = TimeSlot & { endTime?: string };

const RO_MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

const RO_DAYS = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];

const defaultBalayage: Partial<BalayageOptions> = {
  hairLength: undefined,
  hairColor: "",
  wantsCut: false,
  wantsStyling: false,
};

function formatDateLabel(date: Date): string {
  return `${RO_DAYS[date.getDay()]} ${date.getDate()} ${RO_MONTHS[date.getMonth()]}`;
}

function buildSlotsUrl(
  date: string,
  serviceId: string,
  balayage: Partial<BalayageOptions>,
): string {
  const params = new URLSearchParams({ date, serviceId });
  if (serviceId === "balayage" && isBalayageOptionsComplete(balayage)) {
    params.set("hairLength", balayage.hairLength);
    params.set("hairColor", balayage.hairColor);
    params.set("wantsCut", String(balayage.wantsCut));
    params.set("wantsStyling", String(balayage.wantsStyling));
  }
  return `/api/slots?${params}`;
}

export default function BookingForm() {
  const searchParams = useSearchParams();
  const bookableDates = getBookableDates();

  const [serviceId, setServiceId] = useState(services[1]?.id ?? "");
  const [balayage, setBalayage] = useState<Partial<BalayageOptions>>(defaultBalayage);
  const [hairColorSelect, setHairColorSelect] = useState("");
  const [customHairColor, setCustomHairColor] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    toDateKey(bookableDates[0] ?? new Date()),
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotWithEnd[]>([]);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  useEffect(() => {
    if (searchParams.get("service") === "balayage") {
      setServiceId("balayage");
    }
  }, [searchParams]);

  const isBalayage = serviceId === "balayage";
  const balayageComplete = isBalayageOptionsComplete(balayage);

  const selectedService = services.find((s) => s.id === serviceId) as
    | Service
    | undefined;

  const estimatedDuration = useMemo(() => {
    if (isBalayage && balayageComplete) {
      return calculateBalayageDuration(balayage);
    }
    return selectedService?.durationMinutes ?? null;
  }, [isBalayage, balayage, balayageComplete, selectedService]);

  const canLoadSlots =
    !!serviceId &&
    !!selectedDate &&
    (!isBalayage || balayageComplete);

  const fetchSlots = useCallback(async () => {
    if (!canLoadSlots) {
      setSlots([]);
      setDurationMinutes(null);
      return;
    }
    setLoadingSlots(true);
    setSelectedTime(null);
    setError(null);
    try {
      const res = await fetch(buildSlotsUrl(selectedDate, serviceId, balayage));
      const data = await res.json();
      if (!res.ok) {
        setSlots([]);
        setError(data.error ?? "Nu am putut încărca intervalele.");
        return;
      }
      setSlots(data.slots ?? []);
      setDurationMinutes(data.durationMinutes ?? null);
    } catch {
      setSlots([]);
      setError("Nu am putut încărca intervalele. Încearcă din nou.");
    } finally {
      setLoadingSlots(false);
    }
  }, [canLoadSlots, selectedDate, serviceId, balayage]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  function handleServiceChange(id: string) {
    setServiceId(id);
    setBalayage({ ...defaultBalayage });
    setHairColorSelect("");
    setCustomHairColor("");
    setSelectedTime(null);
  }

  function updateBalayage(patch: Partial<BalayageOptions>) {
    setBalayage((prev) => ({ ...prev, ...patch }));
    setSelectedTime(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTime) return;

    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      date: selectedDate,
      time: selectedTime,
      serviceId,
      clientName,
      clientPhone,
      clientEmail,
    };

    if (isBalayage && balayageComplete) {
      payload.hairLength = balayage.hairLength;
      payload.hairColor = balayage.hairColor;
      payload.wantsCut = balayage.wantsCut;
      payload.wantsStyling = balayage.wantsStyling;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Rezervarea nu a putut fi finalizată.");
        await fetchSlots();
        return;
      }

      setSuccess(true);
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setSelectedTime(null);
      setBalayage({ ...defaultBalayage });
      await fetchSlots();
    } catch {
      setError("Eroare de conexiune. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedSlot = slots.find((s) => s.time === selectedTime);

  if (success) {
    return (
      <div className="border border-accent/40 bg-surface p-10 text-center">
        <p className="font-display text-3xl text-accent">Rezervare confirmată</p>
        <p className="mt-4 text-muted">
          Îți mulțumim! Te așteptăm la salon. Vei primi un mesaj de confirmare.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-8 border border-accent px-6 py-3 text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent hover:text-background"
        >
          Rezervă alt interval
        </button>
      </div>
    );
  }

  let stepCounter = 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section>
        <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-accent">
          {stepCounter++}. Alege serviciul
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {services
            .filter((s) => s.id !== "consultatie")
            .map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceChange(service.id)}
                className={`border p-4 text-left transition-all ${
                  serviceId === service.id
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <p className="font-medium text-foreground">{service.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {service.id === "balayage"
                    ? "de la 4 ore · durată personalizată"
                    : `${service.priceLabel ?? `${service.price} lei`} · ${service.durationMinutes} min`}
                </p>
              </button>
            ))}
        </div>
      </section>

      {isBalayage && (
        <section className="border border-accent/20 bg-surface/50 p-6">
          <h2 className="mb-2 text-xs uppercase tracking-[0.25em] text-accent">
            {stepCounter++}. Detalii balayage
          </h2>
          <p className="mb-6 text-sm text-muted">
            Durata se calculează automat în funcție de lungimea părului și
            serviciile extra. Intervalul ales va fi blocat complet în calendar.
          </p>

          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.15em] text-muted">
                Lungimea părului *
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.keys(hairLengthLabels) as HairLength[]).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => updateBalayage({ hairLength: len })}
                    className={`border p-4 text-left transition-all ${
                      balayage.hairLength === len
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <p className="font-medium text-foreground">
                      {hairLengthLabels[len]}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {len === "scurt" && "min. 4 ore"}
                      {len === "mediu" && "~5h – 5h30"}
                      {len === "lung" && "min. 7 ore"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">
                  Culoarea actuală a părului *
                </span>
                <select
                  value={hairColorSelect}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHairColorSelect(val);
                    if (val === "Altul") {
                      updateBalayage({ hairColor: customHairColor });
                    } else {
                      setCustomHairColor("");
                      updateBalayage({ hairColor: val });
                    }
                  }}
                  className="w-full border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                >
                  <option value="">Selectează...</option>
                  {hairColorOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              {hairColorSelect === "Altul" && (
                <input
                  className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-foreground outline-none focus:border-accent"
                  placeholder="Descrie culoarea părului tău"
                  value={customHairColor}
                  onChange={(e) => {
                    setCustomHairColor(e.target.value);
                    updateBalayage({ hairColor: e.target.value });
                  }}
                />
              )}
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.15em] text-muted">
                Servicii extra (+30 min fiecare)
              </p>
              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center gap-3 border border-border px-4 py-3 has-[:checked]:border-accent has-[:checked]:bg-accent/10">
                  <input
                    type="checkbox"
                    checked={balayage.wantsCut ?? false}
                    onChange={(e) =>
                      updateBalayage({ wantsCut: e.target.checked })
                    }
                  />
                  <span className="text-sm text-foreground">+ Tuns</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 border border-border px-4 py-3 has-[:checked]:border-accent has-[:checked]:bg-accent/10">
                  <input
                    type="checkbox"
                    checked={balayage.wantsStyling ?? false}
                    onChange={(e) =>
                      updateBalayage({ wantsStyling: e.target.checked })
                    }
                  />
                  <span className="text-sm text-foreground">+ Coafat</span>
                </label>
              </div>
            </div>

            {estimatedDuration && balayage.hairLength && (
              <div className="border border-accent/30 bg-accent/5 p-4">
                <p className="text-sm text-muted">
                  Durată estimată:{" "}
                  <span className="font-medium text-accent">
                    {formatDuration(estimatedDuration)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {(!isBalayage || balayageComplete) && (
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-accent">
            {stepCounter++}. Alege ziua
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {bookableDates.slice(0, 21).map((date) => {
              const key = toDateKey(date);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedDate(key);
                    setSelectedTime(null);
                  }}
                  className={`min-w-[5.5rem] shrink-0 border px-3 py-3 text-center text-sm transition-all ${
                    selectedDate === key
                      ? "border-accent bg-accent text-background"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  {formatDateLabel(date)}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {canLoadSlots && (
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-accent">
            {stepCounter++}. Alege ora de început
          </h2>
          {durationMinutes && durationMinutes >= 120 && (
            <p className="mb-4 text-sm text-muted">
              Se afișează doar orele la care încape întreaga programare de{" "}
              <span className="text-accent">{formatDuration(durationMinutes)}</span>.
            </p>
          )}
          {loadingSlots ? (
            <p className="text-muted">Se încarcă intervalele...</p>
          ) : slots.length === 0 ? (
            <p className="text-muted">
              Nu există intervale disponibile în această zi pentru durata
              selectată.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.15em] text-muted">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 border border-accent bg-accent/20" />
                  Liber
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 border border-border bg-border/30" />
                  Ocupat
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {slots.map((slot) => {
                  const isAvailable = slot.status === "available";
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`border px-3 py-3 text-left text-sm transition-all ${
                        !isAvailable
                          ? "cursor-not-allowed border-border/50 bg-border/10 text-muted/40"
                          : isSelected
                            ? "border-accent bg-accent text-background"
                            : "border-accent/30 bg-accent/10 text-foreground hover:border-accent"
                      }`}
                    >
                      <span className="block font-medium">{slot.time}</span>
                      {isAvailable &&
                        slot.endTime &&
                        durationMinutes &&
                        durationMinutes >= 120 && (
                          <span
                            className={`mt-0.5 block text-xs ${
                              isSelected ? "text-background/80" : "text-muted"
                            }`}
                          >
                            → {slot.endTime}
                          </span>
                        )}
                      {!isAvailable && (
                        <span className="mt-0.5 block text-xs line-through opacity-50">
                          ocupat
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {selectedTime && (
        <section className="border-t border-border/60 pt-10">
          <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-accent">
            {stepCounter++}. Datele tale
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">
                Nume complet *
              </span>
              <input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-border bg-transparent px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="Numele tău"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">
                Telefon *
              </span>
              <input
                required
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full border border-border bg-transparent px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="07xx xxx xxx"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">
                Email (opțional)
              </span>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full border border-border bg-transparent px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="email@exemplu.ro"
              />
            </label>
          </div>

          <div className="mt-6 border border-border/60 bg-surface p-4 text-sm text-muted">
            <p>
              <span className="text-foreground">{selectedService?.name}</span>
              {isBalayage && balayage.hairLength && (
                <> · {hairLengthLabels[balayage.hairLength]}</>
              )}
              {isBalayage && balayage.wantsCut && " · Tuns"}
              {isBalayage && balayage.wantsStyling && " · Coafat"}
            </p>
            <p className="mt-2">
              {formatDateLabel(
                bookableDates.find((d) => toDateKey(d) === selectedDate) ??
                  new Date(),
              )}{" "}
              · {selectedTime}
              {selectedSlot?.endTime && ` – ${selectedSlot.endTime}`}
              {durationMinutes && ` (${formatDuration(durationMinutes)})`}
            </p>
            {isBalayage && balayage.hairColor && (
              <p className="mt-2 text-xs">Culoare păr: {balayage.hairColor}</p>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full border border-accent bg-accent py-4 text-xs uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-12"
          >
            {submitting ? "Se procesează..." : "Confirmă rezervarea"}
          </button>
        </section>
      )}
    </form>
  );
}
