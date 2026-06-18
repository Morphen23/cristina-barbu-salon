import Link from "next/link";
import { salon } from "@/lib/config";
import MobileNav from "@/components/MobileNav";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/servicii", label: "Servicii & Prețuri" },
  { href: "/rezervari", label: "Rezervări" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[rgba(248,246,243,0.92)] backdrop-blur-xl pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8 md:px-10 md:py-7">
        <Link href="/" className="group min-w-0 flex-1">
          <p className="truncate font-display text-xl tracking-wide text-foreground transition-colors group-hover:text-accent sm:text-2xl">
            {salon.name}
          </p>
          <p className="mt-0.5 truncate text-[0.6rem] uppercase tracking-[0.25em] text-muted sm:text-[0.65rem] sm:tracking-[0.3em]">
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

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/rezervari"
            className="hidden border border-border-strong px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] text-foreground transition-all hover:border-accent hover:text-accent sm:inline-block md:px-6"
          >
            Rezervă
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
