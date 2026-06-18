import path from "path";

export function getDataDir(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "cristina-barbu-salon-data");
  }
  return path.join(process.cwd(), "data");
}
