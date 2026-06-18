import { salon } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background-subtle/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-8 py-16 md:flex-row md:items-end md:justify-between md:px-10 md:py-20">
        <div>
          <p className="font-display text-3xl text-foreground">{salon.name}</p>
          <p className="mt-2 text-sm tracking-wide text-muted">{salon.byline}</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            {salon.description}
          </p>
        </div>
        <div className="space-y-2 text-sm text-muted">
          <p>{salon.address}</p>
          <p>{salon.phone}</p>
          <p>{salon.email}</p>
          <p>{salon.instagram}</p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-[0.65rem] uppercase tracking-[0.22em] text-muted">
        © {new Date().getFullYear()} {salon.name} · {salon.byline}
      </div>
    </footer>
  );
}
