import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { getProfile } from "@/lib/profile";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const P = await getProfile();
  return {
    title: `${P.name} | ${P.custom ? "Quiropraxia y kinesiología" : "Turnos online"}`,
    description: P.custom
      ? `${P.tagline}. Reservá tu turno online con ${P.professional}.`
      : `${P.tagline} en ${P.name}.`,
    // La demo no debe aparecer en Google.
    ...(P.isDemo ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const P = await getProfile();
  return (
    <html
      lang="es-AR"
      data-palette={P.custom ? undefined : "neutral"}
      className={`${display.variable} ${body.variable}`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
