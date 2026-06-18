"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/servicii", label: "Servicii & Prețuri" },
  { href: "/rezervari", label: "Rezervări" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center border border-border-strong text-foreground"
      >
        <span className="sr-only">Meniu</span>
        <span className="flex flex-col gap-1.5">
          <span
            className={`block h-px w-5 bg-foreground transition-transform duration-300 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-foreground transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-foreground transition-transform duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 top-[73px] z-40 bg-[rgba(248,246,243,0.97)] backdrop-blur-xl">
          <nav className="flex flex-col gap-1 px-5 py-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b border-border py-4 text-sm uppercase tracking-[0.2em] ${
                  pathname === link.href ? "text-foreground" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/rezervari"
              className="btn-premium mt-6 border border-foreground bg-foreground py-4 text-center text-[0.65rem] uppercase tracking-[0.22em] text-background"
            >
              Rezervă acum
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
