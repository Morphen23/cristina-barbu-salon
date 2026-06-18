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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-16 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">
          Servicii & Prețuri
        </p>
        <h1 className="mt-4 font-display text-5xl text-foreground">
          Ce îți oferim
        </h1>
        <p className="mt-6 leading-relaxed text-muted">
          Prețurile sunt orientative și pot varia în funcție de lungimea părului,
          complexitatea lucrării și produsele folosite. Consultația ne ajută să
          stabilim prețul exact.
        </p>
      </div>

      <div className="space-y-16">
        {grouped.map((group) => (
          <section key={group.category}>
            <h2 className="mb-8 border-b border-border/60 pb-4 font-display text-2xl text-accent">
              {group.label}
            </h2>
            <div className="divide-y divide-border/40">
              {group.items.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="max-w-xl">
                    <h3 className="text-lg font-medium text-foreground">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted/70">
                      Durată: ~{service.durationMinutes} min
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-2xl text-accent">
                    {service.priceLabel ??
                      (service.price === 0 ? "Gratuit" : `${service.price} lei`)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-20 border border-accent/30 bg-surface p-10 text-center">
        <h2 className="font-display text-3xl text-foreground">
          Programează-te online
        </h2>
        <p className="mt-3 text-muted">
          Vezi intervalele libere și rezervă direct din calendar.
        </p>
        <Link
          href="/rezervari"
          className="mt-6 inline-block border border-accent bg-accent px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90"
        >
          Mergi la rezervări
        </Link>
      </div>
    </div>
  );
}
