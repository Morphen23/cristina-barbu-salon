import { salon } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl text-foreground">{salon.name}</p>
          <p className="mt-1 text-sm text-muted">{salon.byline}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {salon.description}
          </p>
        </div>
        <div className="text-sm text-muted">
          <p>{salon.address}</p>
          <p className="mt-2">{salon.phone}</p>
          <p className="mt-2">{salon.email}</p>
          <p className="mt-2">{salon.instagram}</p>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs uppercase tracking-[0.2em] text-muted">
        © {new Date().getFullYear()} {salon.name} · {salon.byline}
      </div>
    </footer>
  );
}
