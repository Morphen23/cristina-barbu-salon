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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 right-0 top-[4px] h-px bg-foreground transition-all duration-300 ${
          open ? "top-1/2 -translate-y-1/2 rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-foreground transition-opacity duration-300 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`absolute bottom-[4px] left-0 right-0 h-px bg-foreground transition-all duration-300 ${
          open ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
        }`}
      />
    </span>
  );
}

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
    if (open) {
      document.body.classList.add("mobile-menu-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("mobile-menu-open");
      document.body.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("mobile-menu-open");
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const menuPanel =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[1000] flex flex-col bg-background md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Meniu navigare"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
              <p className="font-display text-lg text-foreground">Meniu</p>
              <button
                type="button"
                aria-label="Închide meniul"
                onClick={close}
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-border-strong bg-background"
              >
                <MenuIcon open />
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`block border-b border-border py-4 text-lg leading-relaxed ${
                    pathname === link.href
                      ? "font-medium text-foreground"
                      : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/rezervari"
                onClick={close}
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
      {!open && (
        <button
          type="button"
          aria-expanded={false}
          aria-label="Deschide meniul"
          aria-controls="mobile-nav-panel"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-border-strong bg-background text-foreground md:hidden"
        >
          <span className="sr-only">Meniu</span>
          <MenuIcon open={false} />
        </button>
      )}
      {menuPanel}
    </>
  );
}
