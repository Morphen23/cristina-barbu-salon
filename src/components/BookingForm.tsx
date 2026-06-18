"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import BookingProgress from "@/components/BookingProgress";
import ServicePreview from "@/components/ServicePreview";
import {
  calculateBalayageDuration,
  formatDuration,
  hairColorOptions,
  hairLengthLabels,
  isBalayageOptionsComplete,
  type BalayageOptions,
  type HairLength,
} from "@/lib/balayage";
import { stylists } from "@/lib/booking-ui";
import { services, type Service } from "@/lib/config";
import { getBookableDates, toDateKey, type TimeSlot } from "@/lib/slots";

type SlotWithEnd = TimeSlot & { endTime?: string };
type StepId = "service" | "details" | "stylist" | "schedule" | "contact";
type StepDirection = "forward" | "back";

const RO_MONTHS = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];
const RO_DAYS = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];

const defaultBalayage: Partial<BalayageOptions> = {
  hairLength: undefined,
  hairColor: "",
  wantsCut: false,
  wantsStyling: false,
};

const bookableServices = services.filter((s) => s.id !== "consultatie");

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

function getStepFlow(isBalayage: boolean): StepId[] {
  return isBalayage
    ? ["service", "details", "stylist", "schedule", "contact"]
    : ["service", "stylist", "schedule", "contact"];
}

const stepLabels: Record<StepId, string> = {
  service: "Serviciu",
  details: "Detalii",
  stylist: "Stilist",
  schedule: "Data & ora",
  contact: "Confirmare",
};

export default function BookingForm() {
  const searchParams = useSearchParams();
  const bookableDates = getBookableDates();

  const [step, setStep] = useState<StepId>("service");
  const [direction, setDirection] = useState<StepDirection>("forward");
  const [serviceId, setServiceId] = useState("");
  const [stylistId, setStylistId] = useState(stylists[0]?.id ?? "");
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
  const steps = getStepFlow(isBalayage);
  const stepIndex = steps.indexOf(step);

  const selectedService = services.find((s) => s.id === serviceId) as
    | Service
    | undefined;
  const selectedStylist = stylists.find((s) => s.id === stylistId);

  const estimatedDuration = useMemo(() => {
    if (isBalayage && balayageComplete) {
      return calculateBalayageDuration(balayage);
    }
    return selectedService?.durationMinutes ?? null;
  }, [isBalayage, balayage, balayageComplete, selectedService]);

  const canLoadSlots =
    step === "schedule" &&
    !!serviceId &&
    !!selectedDate &&
    (!isBalayage || balayageComplete);

  const fetchSlots = useCallback(async () => {
    if (!canLoadSlots) return;
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

  function goTo(next: StepId, dir: StepDirection = "forward") {
    setDirection(dir);
    setStep(next);
    setError(null);
  }

  function goNext() {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) goTo(steps[idx + 1]!);
  }

  function goBack() {
    const idx = steps.indexOf(step);
    if (idx > 0) goTo(steps[idx - 1]!, "back");
  }

  function handleServiceSelect(id: string) {
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

  function canContinue(): boolean {
    switch (step) {
      case "service":
        return !!serviceId;
      case "details":
        return balayageComplete;
      case "stylist":
        return !!stylistId;
      case "schedule":
        return !!selectedTime;
      default:
        return false;
    }
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
        return;
      }

      setSuccess(true);
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setSelectedTime(null);
      setServiceId("");
      setStep("service");
    } catch {
      setError("Eroare de conexiune. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedSlot = slots.find((s) => s.time === selectedTime);
  const stepAnim = direction === "forward" ? "step-enter-forward" : "step-enter-back";

  if (success) {
    return (
      <div className="booking-reveal glass-card p-12 text-center md:p-16">
        <p className="font-display text-4xl text-foreground">Rezervare confirmată</p>
        <p className="mx-auto mt-6 max-w-md leading-relaxed text-muted">
          Îți mulțumim! Te așteptăm la salon. Vei primi un mesaj de confirmare.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setBalayage({ ...defaultBalayage });
          }}
          className="btn-premium mt-10 border border-border-strong px-8 py-3.5 text-[0.65rem] uppercase tracking-[0.22em] text-foreground"
        >
          Rezervă alt interval
        </button>
      </div>
    );
  }

  return (
    <div>
      <BookingProgress
        steps={steps.map((id) => stepLabels[id])}
        currentIndex={stepIndex}
      />

      <div
        key={step}
        className={stepAnim}
      >
        {step === "service" && (
          <section className="space-y-8">
            <div>
              <h2 className="font-display text-3xl text-foreground md:text-4xl">
                Ce serviciu îți dorești?
              </h2>
              <p className="mt-3 max-w-lg text-muted">
                Alege o singură opțiune. Poți reveni oricând la pasul anterior.
              </p>
            </div>
            <div className="space-y-3">
              {bookableServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service.id)}
                  className={`glass-card glass-card-interactive flex w-full items-center justify-between gap-6 p-5 text-left md:p-6 ${
                    serviceId === service.id ? "glass-slot-selected" : ""
                  }`}
                >
                  <div>
                    <p className="font-display text-xl text-foreground">{service.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {service.id === "balayage"
                        ? "de la 4 ore · personalizat"
                        : `${service.priceLabel ?? `${service.price} lei`} · ${service.durationMinutes} min`}
                    </p>
                  </div>
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                    {serviceId === service.id ? "Selectat" : "Alege"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "details" && isBalayage && (
          <section className="space-y-8">
            <div>
              <h2 className="font-display text-3xl text-foreground md:text-4xl">
                Câteva detalii despre păr
              </h2>
              <p className="mt-3 max-w-lg text-muted">
                Calculăm durata exactă și blocăm intervalul complet în calendar.
              </p>
            </div>
            <div className="space-y-8">
              <div>
                <p className="mb-4 text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                  Lungimea părului
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(hairLengthLabels) as HairLength[]).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => updateBalayage({ hairLength: len })}
                      className={`glass-slot glass-slot-interactive p-5 text-left ${
                        balayage.hairLength === len ? "glass-slot-selected" : ""
                      }`}
                    >
                      <p className="font-medium">{hairLengthLabels[len]}</p>
                      <p className="mt-1 text-xs text-muted">
                        {len === "scurt" && "min. 4 ore"}
                        {len === "mediu" && "~5h – 5h30"}
                        {len === "lung" && "min. 7 ore"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                  Culoarea actuală
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
                  className="glass-slot w-full px-4 py-3.5 outline-none focus:glass-slot-selected"
                >
                  <option value="">Selectează...</option>
                  {hairColorOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              {hairColorSelect === "Altul" && (
                <input
                  className="glass-slot w-full px-4 py-3.5 outline-none focus:glass-slot-selected"
                  placeholder="Descrie culoarea părului tău"
                  value={customHairColor}
                  onChange={(e) => {
                    setCustomHairColor(e.target.value);
                    updateBalayage({ hairColor: e.target.value });
                  }}
                />
              )}

              <div className="flex flex-wrap gap-3">
                <label className="glass-slot flex cursor-pointer items-center gap-3 px-5 py-3.5 has-[:checked]:glass-slot-selected">
                  <input
                    type="checkbox"
                    checked={balayage.wantsCut ?? false}
                    onChange={(e) => updateBalayage({ wantsCut: e.target.checked })}
                  />
                  <span className="text-sm">+ Tuns</span>
                </label>
                <label className="glass-slot flex cursor-pointer items-center gap-3 px-5 py-3.5 has-[:checked]:glass-slot-selected">
                  <input
                    type="checkbox"
                    checked={balayage.wantsStyling ?? false}
                    onChange={(e) => updateBalayage({ wantsStyling: e.target.checked })}
                  />
                  <span className="text-sm">+ Coafat</span>
                </label>
              </div>

              {estimatedDuration && balayage.hairLength && (
                <p className="text-sm text-muted">
                  Durată estimată ·{" "}
                  <span className="text-foreground">{formatDuration(estimatedDuration)}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {step === "stylist" && (
          <section className="space-y-8">
            <div>
              <h2 className="font-display text-3xl text-foreground md:text-4xl">
                Cu cine programezi?
              </h2>
              <p className="mt-3 max-w-lg text-muted">
                Echipa noastră de colorare te așteaptă cu o consultație personalizată.
              </p>
            </div>
            <div className="space-y-4">
              {stylists.map((stylist) => (
                <button
                  key={stylist.id}
                  type="button"
                  onClick={() => setStylistId(stylist.id)}
                  className={`glass-card glass-card-interactive flex w-full items-center gap-5 p-5 text-left md:p-6 ${
                    stylistId === stylist.id ? "glass-slot-selected" : ""
                  }`}
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={stylist.image}
                      alt={stylist.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-foreground">{stylist.name}</p>
                    <p className="mt-1 text-sm text-accent">{stylist.role}</p>
                    <p className="mt-2 text-sm text-muted">{stylist.bio}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "schedule" && (
          <section>
            <div className="mb-10">
              <h2 className="font-display text-3xl text-foreground md:text-4xl">
                Alege ziua și ora
              </h2>
              <p className="mt-3 max-w-lg text-muted">
                Vezi inspirația pentru serviciul tău în timp ce alegi momentul perfect.
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[minmax(240px,300px)_1fr] lg:gap-12">
              <ServicePreview
                service={selectedService}
                stylistName={selectedStylist?.name}
                durationMinutes={estimatedDuration ?? durationMinutes}
              />

              <div className="space-y-8">
                <div>
                  <p className="mb-4 text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                    Ziua
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {bookableDates.slice(0, 14).map((date) => {
                      const key = toDateKey(date);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedDate(key);
                            setSelectedTime(null);
                          }}
                          className={`glass-slot glass-slot-interactive min-w-[5.5rem] shrink-0 px-3 py-3 text-center text-sm ${
                            selectedDate === key ? "glass-slot-selected font-medium" : "text-muted"
                          }`}
                        >
                          {formatDateLabel(date)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                    Ora
                  </p>
                  {loadingSlots ? (
                    <p className="text-muted">Se încarcă intervalele...</p>
                  ) : slots.length === 0 ? (
                    <p className="text-muted">
                      Nu există intervale libere în această zi. Încearcă altă dată.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {slots.map((slot, index) => {
                        const isAvailable = slot.status === "available";
                        const isSelected = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedTime(slot.time)}
                            style={{ animationDelay: `${Math.min(index, 8) * 0.035}s` }}
                            className={`booking-reveal px-4 py-3.5 text-left text-sm ${
                              !isAvailable
                                ? "glass-slot-occupied cursor-not-allowed text-muted/45"
                                : isSelected
                                  ? "glass-slot glass-slot-interactive glass-slot-selected font-medium"
                                  : "glass-slot glass-slot-interactive"
                            }`}
                          >
                            <span className="block font-medium">{slot.time}</span>
                            {isAvailable && slot.endTime && durationMinutes && durationMinutes >= 120 && (
                              <span className="mt-1 block text-xs text-muted">→ {slot.endTime}</span>
                            )}
                            {!isAvailable && (
                              <span className="mt-1 block text-xs opacity-50">ocupat</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === "contact" && (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(220px,260px)_1fr] lg:gap-12">
              <ServicePreview
                service={selectedService}
                stylistName={selectedStylist?.name}
                durationMinutes={durationMinutes ?? estimatedDuration}
                compact
              />
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-3xl text-foreground md:text-4xl">
                    Ultimele detalii
                  </h2>
                  <p className="mt-3 text-muted">
                    {formatDateLabel(
                      bookableDates.find((d) => toDateKey(d) === selectedDate) ?? new Date(),
                    )}{" "}
                    · {selectedTime}
                    {selectedSlot?.endTime && ` – ${selectedSlot.endTime}`}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                      Nume complet
                    </span>
                    <input
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="glass-slot w-full px-4 py-3.5 outline-none focus:glass-slot-selected"
                      placeholder="Numele tău"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                      Telefon
                    </span>
                    <input
                      required
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="glass-slot w-full px-4 py-3.5 outline-none focus:glass-slot-selected"
                      placeholder="07xx xxx xxx"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                      Email (opțional)
                    </span>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="glass-slot w-full px-4 py-3.5 outline-none focus:glass-slot-selected"
                      placeholder="email@exemplu.ro"
                    />
                  </label>
                </div>

                {error && <p className="text-sm text-[#9a6b6b]">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-premium w-full border border-foreground bg-foreground py-4 text-[0.65rem] uppercase tracking-[0.22em] text-background disabled:opacity-50 sm:w-auto sm:px-14"
                >
                  {submitting ? "Se procesează..." : "Confirmă rezervarea"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {step !== "contact" && (
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-8">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="text-[0.65rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
            >
              ← Înapoi
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue()}
            className="btn-premium border border-foreground bg-foreground px-10 py-3.5 text-[0.65rem] uppercase tracking-[0.22em] text-background disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuă →
          </button>
        </div>
      )}

      {step === "contact" && stepIndex > 0 && (
        <div className="mt-8 border-t border-border pt-8">
          <button
            type="button"
            onClick={goBack}
            className="text-[0.65rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
          >
            ← Înapoi la programare
          </button>
        </div>
      )}
    </div>
  );
}
