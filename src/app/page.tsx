import Link from "next/link";
import { salon } from "@/lib/config";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-accent)_0%,_transparent_50%)] opacity-10" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 md:py-32">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">
            {salon.tagline}
          </p>
          <h1 className="max-w-3xl font-display text-5xl leading-tight text-foreground md:text-7xl">
            {salon.name}
          </h1>
          <p className="text-lg uppercase tracking-[0.2em] text-muted">
            {salon.byline}
          </p>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            {salon.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/rezervari"
              className="border border-accent bg-accent px-8 py-4 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90"
            >
              Rezervă o programare
            </Link>
            <Link
              href="/servicii"
              className="border border-border px-8 py-4 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Vezi serviciile
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl text-foreground">
              Arta culorii, în mâinile tale
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              Sunt Cristina Barbu, colorist cu pasiune pentru balayage și
              transformări naturale. Fiecare clientă primește o consultație
              personalizată — pentru că frumusețea ta merită o abordare unică.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Lucrez exclusiv cu produse profesionale și tehnici moderne, pentru
              rezultate care arată bine atât în salon, cât și săptămâni după.
            </p>
          </div>
          <div className="grid gap-6">
            {[
              {
                title: "Balayage & Color",
                text: "Specializare în tehnici de colorare naturală și lumină.",
              },
              {
                title: "Consultație personalizată",
                text: "Analizăm împreună nuanța perfectă pentru tine.",
              },
              {
                title: "Experiență premium",
                text: "Atmosferă elegantă, atenție la detalii, rezultate impecabile.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-border/60 bg-surface p-6"
              >
                <h3 className="font-display text-xl text-accent">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="font-display text-4xl text-foreground">
            Gata pentru o transformare?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Alege ziua și intervalul care ți se potrivește — direct online, în
            câteva minute.
          </p>
          <Link
            href="/rezervari"
            className="mt-8 inline-block border border-accent px-10 py-4 text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent hover:text-background"
          >
            Rezervă acum
          </Link>
        </div>
      </section>
    </>
  );
}
