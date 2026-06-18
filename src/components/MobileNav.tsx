"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/servicii", label: "Servicii & Prețuri" },
  { href: "/rezervari", label: "Rezervări" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const menuPanel =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              aria-label="Închide meniul"
              className="absolute inset-0 bg-background"
              onClick={() => setOpen(false)}
            />
            <nav className="relative z-[201] flex h-full flex-col bg-background px-5 pb-8 pt-[calc(env(safe-area-inset-top)+5.25rem)]">
              <div className="flex flex-col gap-0">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block border-b border-border py-4 text-base leading-snug ${
                      pathname === link.href
                        ? "font-medium text-foreground"
                        : "text-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <Link
                href="/rezervari"
                onClick={() => setOpen(false)}
                className="btn-premium mt-8 block border border-foreground bg-foreground py-4 text-center text-[0.65rem] uppercase tracking-[0.18em] text-background"
              >
                Rezervă acum
              </Link>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[210] flex h-11 w-11 items-center justify-center border border-border-strong bg-background text-foreground md:hidden"
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
      {menuPanel}
    </>
  );
}
