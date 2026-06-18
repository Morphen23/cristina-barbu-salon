export type Stylist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
};

export const stylists: Stylist[] = [
  {
    id: "cristina",
    name: "Cristina Barbu",
    role: "Colorist · Specialist balayage",
    bio: "Pasiune pentru nuanțe naturale, lumină și finisaje impecabile.",
    image: "/services/stylist-cristina.svg",
  },
];

export type ServiceVisual = {
  image: string;
  caption: string;
  mood: string;
};

export const serviceVisuals: Record<string, ServiceVisual> = {
  balayage: {
    image: "/services/balayage.svg",
    caption: "Balayage natural, lumină moale",
    mood: "Efect sun-kissed, finisaj premium",
  },
  "colorare-completa": {
    image: "/services/colorare.svg",
    caption: "Culoare uniformă, strălucire satinată",
    mood: "Nuanțe bogate, acoperire impecabilă",
  },
  "refresh-color": {
    image: "/services/refresh.svg",
    caption: "Refresh discret la rădăcină",
    mood: "Prospețime rapidă, aspect natural",
  },
  "tuns-styling": {
    image: "/services/styling.svg",
    caption: "Tuns & styling rafinat",
    mood: "Siluetă definită, mișcare ușoară",
  },
  tratament: {
    image: "/services/tratament.svg",
    caption: "Tratament de reconstrucție",
    mood: "Păr regenerat, textură mătăsoasă",
  },
};

export function getServiceVisual(serviceId: string): ServiceVisual {
  return (
    serviceVisuals[serviceId] ?? {
      image: "/services/colorare.svg",
      caption: "Experiență Color & Balayage",
      mood: "Rezultat elegant, personalizat",
    }
  );
}

export function getStylistById(id: string): Stylist | undefined {
  return stylists.find((s) => s.id === id);
}
