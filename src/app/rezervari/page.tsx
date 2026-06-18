import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import RezervariIntro from "@/components/RezervariIntro";

export default function RezervariPage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-20 md:px-10 md:py-28">
      <RezervariIntro />
      <Suspense
        fallback={
          <p className="booking-reveal booking-reveal-delay-3 text-muted">
            Se încarcă formularul de rezervare...
          </p>
        }
      >
        <BookingForm />
      </Suspense>
    </div>
  );
}
