import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import { salon } from "@/lib/config";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: `${salon.name} · ${salon.byline}`,
  description: salon.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#f8f6f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${lato.variable} h-full overflow-x-hidden`}>
      <body className="flex min-h-full w-full max-w-[100vw] flex-col overflow-x-hidden antialiased font-sans pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
