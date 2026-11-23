import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { BUSINESS } from "@/lib/business";
import { IS_DEMO } from "@/lib/demo";

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

export const metadata: Metadata = {
  title: `${BUSINESS.name} | Quiropraxia y kinesiología`,
  description: `${BUSINESS.tagline}. Reservá tu turno online con ${BUSINESS.professional}.`,
  // La demo no debe aparecer en Google.
  ...(IS_DEMO ? { robots: { index: false, follow: false } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
