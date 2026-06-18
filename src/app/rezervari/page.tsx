import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";

export default function RezervariPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">
          Rezervări online
        </p>
        <h1 className="mt-4 font-display text-5xl text-foreground">
          Alege ziua și ora
        </h1>
        <p className="mt-6 max-w-xl leading-relaxed text-muted">
          Intervalele disponibile sunt verzi, cele ocupate sunt gri. Pentru
          balayage, completează detaliile despre păr — durata se calculează
          automat (4–7+ ore) și întregul interval se blochează în calendar.
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-muted">Se încarcă formularul de rezervare...</p>
        }
      >
        <BookingForm />
      </Suspense>
    </div>
  );
}
