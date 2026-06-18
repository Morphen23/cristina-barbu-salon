export const salon = {
  name: "Color & Balayage",
  byline: "by Cristina Barbu",
  tagline: "Color & Balayage · București",
  description:
    "Atelier de colorare și balayage pentru femei care caută eleganță, naturalețe și rezultate impecabile.",
  email: "contact@cristinabarbu.ro",
  phone: "+40 7XX XXX XXX",
  address: "București",
  instagram: "@cristinabarbu.color",
} as const;

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel?: string;
  durationMinutes: number;
  category: "color" | "cut" | "treatment";
};

export const services: Service[] = [
  {
    id: "consultatie",
    name: "Consultație color",
    description: "Analiză personalizată, alegerea nuanței și plan de transformare.",
    price: 0,
    priceLabel: "Gratuit la programare",
    durationMinutes: 30,
    category: "color",
  },
  {
    id: "balayage",
    name: "Balayage",
    description:
      "Tehnici de balayage pentru un efect natural, luminos și sofisticat. Durata se stabilește după lungimea părului.",
    price: 450,
    priceLabel: "de la 450 lei",
    durationMinutes: 240,
    category: "color",
  },
  {
    id: "colorare-completa",
    name: "Colorare completă",
    description: "Colorare uniformă sau acoperire completă, cu produse profesionale.",
    price: 300,
    priceLabel: "de la 300 lei",
    durationMinutes: 120,
    category: "color",
  },
  {
    id: "refresh-color",
    name: "Refresh color / retuș",
    description: "Reîmprospătarea culorii la rădăcină sau retuș balayage.",
    price: 200,
    priceLabel: "de la 200 lei",
    durationMinutes: 90,
    category: "color",
  },
  {
    id: "tuns-styling",
    name: "Tuns & styling",
    description: "Tuns personalizat și styling finisat pentru orice ocazie.",
    price: 120,
    priceLabel: "de la 120 lei",
    durationMinutes: 60,
    category: "cut",
  },
  {
    id: "tratament",
    name: "Tratament reconstrucție",
    description: "Tratament intensiv pentru păr deteriorat sau uscat.",
    price: 150,
    priceLabel: "de la 150 lei",
    durationMinutes: 45,
    category: "treatment",
  },
];

export const schedule = {
  slotIntervalMinutes: 30,
  days: {
    0: null,
    1: { open: "10:00", close: "19:00" },
    2: { open: "10:00", close: "19:00" },
    3: { open: "10:00", close: "19:00" },
    4: { open: "10:00", close: "19:00" },
    5: { open: "10:00", close: "19:00" },
    6: { open: "10:00", close: "16:00" },
  } as Record<number, { open: string; close: string } | null>,
  maxDaysAhead: 60,
};

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}
