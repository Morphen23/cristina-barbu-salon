import { salon } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background-subtle/50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-16 md:flex-row md:items-end md:justify-between md:px-10 md:py-20">
        <div className="min-w-0">
          <p className="font-display text-2xl text-foreground sm:text-3xl">{salon.name}</p>
          <p className="mt-1 text-sm tracking-wide text-muted">{salon.byline}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted sm:mt-6">
            {salon.description}
          </p>
        </div>
        <div className="space-y-1.5 text-sm text-muted">
          <p>{salon.address}</p>
          <p>{salon.phone}</p>
          <p>{salon.email}</p>
          <p>{salon.instagram}</p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-[0.6rem] uppercase tracking-[0.18em] text-muted sm:text-[0.65rem]">
        © {new Date().getFullYear()} {salon.name} · {salon.byline}
      </div>
    </footer>
  );
}
