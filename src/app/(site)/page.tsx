import Link from "next/link";
import { salon } from "@/lib/config";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 px-4 py-16 sm:gap-10 sm:px-8 sm:py-24 md:gap-14 md:px-10 md:py-40">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-accent sm:text-[0.65rem] sm:tracking-[0.4em]">
            {salon.tagline}
          </p>
          <h1 className="max-w-3xl font-display text-4xl leading-[1.12] text-foreground sm:text-5xl md:text-7xl md:leading-[1.08]">
            {salon.name}
          </h1>
          <p className="text-sm uppercase tracking-[0.25em] text-muted">
            {salon.byline}
          </p>
          <p className="max-w-lg text-base leading-relaxed text-muted md:text-lg">
            {salon.description}
          </p>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:flex-wrap sm:gap-5 sm:pt-6">
            <Link
              href="/rezervari"
              className="btn-premium w-full border border-foreground bg-foreground px-8 py-4 text-center text-[0.65rem] uppercase tracking-[0.22em] text-background sm:w-auto sm:px-10"
            >
              Rezervă o programare
            </Link>
            <Link
              href="/servicii"
              className="btn-premium w-full border border-border-strong px-8 py-4 text-center text-[0.65rem] uppercase tracking-[0.22em] text-foreground sm:w-auto sm:px-10"
            >
              Vezi serviciile
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 md:px-10 md:py-36">
        <div className="grid gap-20 md:grid-cols-2 md:gap-24">
          <div>
            <h2 className="font-display text-3xl leading-snug text-foreground sm:text-4xl md:text-5xl">
              Arta culorii, în mâinile tale
            </h2>
            <p className="mt-8 leading-relaxed text-muted">
              Sunt Cristina Barbu, colorist cu pasiune pentru balayage și
              transformări naturale. Fiecare clientă primește o consultație
              personalizată — pentru că frumusețea ta merită o abordare unică.
            </p>
            <p className="mt-6 leading-relaxed text-muted">
              Lucrez exclusiv cu produse profesionale și tehnici moderne, pentru
              rezultate care arată bine atât în salon, cât și săptămâni după.
            </p>
          </div>
          <div className="grid gap-5">
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
              <div key={item.title} className="glass-card p-6 sm:p-8 md:p-9">
                <h3 className="font-display text-xl text-foreground sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background-subtle/40">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-8 sm:py-28 md:px-10 md:py-36">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
            Gata pentru o transformare?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted sm:mt-6">
            Alege ziua și intervalul care ți se potrivește — direct online, în
            câteva minute.
          </p>
          <Link
            href="/rezervari"
            className="btn-premium mt-8 inline-block w-full border border-foreground px-8 py-4 text-[0.65rem] uppercase tracking-[0.22em] text-foreground sm:mt-12 sm:w-auto sm:px-12"
          >
            Rezervă acum
          </Link>
        </div>
      </section>
    </>
  );
}
