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
    <div className="mx-auto max-w-6xl px-8 py-20 md:px-10 md:py-28">
      <div className="mb-20 max-w-2xl md:mb-28">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-accent">
          Servicii & Prețuri
        </p>
        <h1 className="mt-6 font-display text-5xl leading-tight text-foreground md:text-6xl">
          Ce îți oferim
        </h1>
        <p className="mt-8 leading-relaxed text-muted">
          Prețurile sunt orientative și pot varia în funcție de lungimea părului,
          complexitatea lucrării și produsele folosite. Consultația ne ajută să
          stabilim prețul exact.
        </p>
      </div>

      <div className="space-y-20 md:space-y-28">
        {grouped.map((group) => (
          <section key={group.category}>
            <h2 className="mb-10 border-b border-border pb-5 font-display text-3xl text-foreground">
              {group.label}
            </h2>
            <div className="divide-y divide-border">
              {group.items.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10"
                >
                  <div className="max-w-xl">
                    <h3 className="font-display text-xl text-foreground">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                    <p className="mt-3 text-[0.65rem] uppercase tracking-[0.18em] text-muted/80">
                      Durată: ~{service.durationMinutes} min
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-2xl text-accent md:text-3xl">
                    {service.priceLabel ??
                      (service.price === 0 ? "Gratuit" : `${service.price} lei`)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="glass-card mt-24 p-12 text-center md:mt-32 md:p-16">
        <h2 className="font-display text-3xl text-foreground md:text-4xl">
          Programează-te online
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
          Vezi intervalele libere și rezervă direct din calendar.
        </p>
        <Link
          href="/rezervari"
          className="mt-10 inline-block border border-foreground bg-foreground px-10 py-3.5 text-[0.65rem] uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-85"
        >
          Mergi la rezervări
        </Link>
      </div>
    </div>
  );
}
