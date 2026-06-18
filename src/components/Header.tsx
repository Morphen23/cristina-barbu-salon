import Link from "next/link";
import { salon } from "@/lib/config";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/servicii", label: "Servicii & Prețuri" },
  { href: "/rezervari", label: "Rezervări" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[rgba(248,246,243,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-7 md:px-10">
        <Link href="/" className="group">
          <p className="font-display text-2xl tracking-wide text-foreground transition-colors group-hover:text-accent">
            {salon.name}
          </p>
          <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.3em] text-muted">
            {salon.byline}
          </p>
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.7rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/rezervari"
          className="border border-border-strong px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] text-foreground transition-all hover:border-accent hover:text-accent md:px-6"
        >
          Rezervă
        </Link>
      </div>
    </header>
  );
}
