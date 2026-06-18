import Link from "next/link";
import { services } from "@/lib/config";

const categoryLabels = {
  color: "Color & Balayage",
  cut: "Tuns & Styling",
  treatment: "Tratamente",
};

const categoryOrder = ["color", "cut", "treatment"] as const;

export default function ServiciiPage() {
  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    items: services.filter((s) => s.category === cat),
  }));

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-14 sm:px-8 sm:py-20 md:px-10 md:py-28">
      <div className="mb-12 max-w-2xl sm:mb-20 md:mb-28">
        <p className="text-[0.6rem] uppercase tracking-[0.22em] text-accent sm:tracking-[0.35em]">
          Servicii & Prețuri
        </p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-foreground sm:mt-6 sm:text-5xl md:text-6xl">
          Ce îți oferim
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:mt-8 sm:text-base">
          Prețurile sunt orientative și pot varia în funcție de lungimea părului,
          complexitatea lucrării și produsele folosite. Consultația ne ajută să
          stabilim prețul exact.
        </p>
      </div>

      <div className="space-y-14 sm:space-y-20 md:space-y-28">
        {grouped.map((group) => (
          <section key={group.category}>
            <h2 className="mb-6 border-b border-border pb-4 font-display text-2xl text-foreground sm:mb-10 sm:pb-5 sm:text-3xl">
              {group.label}
            </h2>
            <div className="divide-y divide-border">
              {group.items.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-10"
                >
                  <div className="min-w-0 max-w-xl">
                    <h3 className="font-display text-lg text-foreground sm:text-xl">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                    <p className="mt-3 text-[0.65rem] uppercase tracking-[0.18em] text-muted/80">
                      Durată: ~{service.durationMinutes} min
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-xl text-accent sm:text-2xl md:text-3xl">
                    {service.priceLabel ??
                      (service.price === 0 ? "Gratuit" : `${service.price} lei`)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="glass-card mt-16 p-8 text-center sm:mt-24 sm:p-12 md:mt-32 md:p-16">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl md:text-4xl">
          Programează-te online
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted sm:mt-4">
          Vezi intervalele libere și rezervă direct din calendar.
        </p>
        <Link
          href="/rezervari"
          className="btn-premium mt-8 inline-block w-full border border-foreground bg-foreground px-8 py-3.5 text-[0.65rem] uppercase tracking-[0.22em] text-background sm:mt-10 sm:w-auto sm:px-10"
        >
          Mergi la rezervări
        </Link>
      </div>
    </div>
  );
}
