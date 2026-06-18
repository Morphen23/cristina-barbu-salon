export type HairLength = "scurt" | "mediu" | "lung";

export type BalayageOptions = {
  hairLength: HairLength;
  hairColor: string;
  wantsCut: boolean;
  wantsStyling: boolean;
};

export const hairLengthLabels: Record<HairLength, string> = {
  scurt: "Scurt (sub umeri)",
  mediu: "Mediu (până la umeri / piept)",
  lung: "Lung (sub piept)",
};

export const hairColorOptions = [
  "Natural / necolorat",
  "Blond",
  "Șaten deschis",
  "Șaten închis",
  "Brun",
  "Roșcat",
  "Vopsit anterior / colorat",
  "Altul",
] as const;

const BASE_DURATION: Record<HairLength, number> = {
  scurt: 240,
  mediu: 330,
  lung: 420,
};

const ADDON_MINUTES = 30;

export function calculateBalayageDuration(options: BalayageOptions): number {
  let total = BASE_DURATION[options.hairLength];
  if (options.wantsCut) total += ADDON_MINUTES;
  if (options.wantsStyling) total += ADDON_MINUTES;
  return total;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} ore`;
  if (h === 0) return `${m} min`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function isBalayageOptionsComplete(
  options: Partial<BalayageOptions>,
): options is BalayageOptions {
  return (
    !!options.hairLength &&
    !!options.hairColor?.trim()
  );
}
