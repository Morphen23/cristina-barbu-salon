import Link from "next/link";
import { salon } from "@/lib/config";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/servicii", label: "Servicii & Prețuri" },
  { href: "/rezervari", label: "Rezervări" },
];

export default function Header() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="group">
          <p className="font-display text-xl tracking-wide text-foreground transition-colors group-hover:text-accent">
            {salon.name}
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            {salon.byline}
          </p>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/rezervari"
          className="rounded-none border border-accent px-4 py-2 text-xs uppercase tracking-[0.2em] text-accent transition-all hover:bg-accent hover:text-background md:px-5"
        >
          Rezervă
        </Link>
      </div>
    </header>
  );
}
