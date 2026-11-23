import { IS_DEMO } from "./demo";

// Datos del negocio. Fuente: assets/datos.txt, el logo y la bio de Instagram.
const REAL = {
  name: "Quiropraxia & Vida",
  professional: "Lic. Hugo Rodríguez",
  firstName: "Hugo",
  title: "Lic. en Kinesiología y Fisioterapia (UNC) · M.P. 202 · Quiropráctico",
  tagline: "Alivio tu dolor recuperando tu equilibrio",
  // Prefijo internacional de móvil argentino (54 9) + 385 4769624.
  whatsapp: "5493854769624",
  whatsappDisplay: "385 476-9624",
  instagram: "https://www.instagram.com/quiropraxia.vida/",
  address: "Catamarca 133, Instituto IMELAS",
  city: "Santiago del Estero, Capital",
  mapQuery: "Catamarca 133, Santiago del Estero, Argentina",
  timezone: "America/Argentina/Buenos_Aires",
  heroBadge: "Quiropráctico · Especialista en columna vertebral",
  intro:
    "Soy el Lic. Hugo Rodríguez, kinesiólogo y quiropráctico, con 20 años de experiencia cuidando la salud de mis pacientes. Evalúo tu caso, te explico qué te pasa y trabajamos juntos para que vuelvas a moverte sin dolor.",
};

// Consultorio ficticio para mostrar el sistema a otros profesionales, sin datos de nadie real.
const DEMO = {
  name: "Quiropraxia Ejemplo",
  professional: "Lic. Ana Ejemplo",
  firstName: "Ana",
  title: "Quiropráctica y rehabilitación · Consultorio de ejemplo",
  tagline: "Alivio tu dolor recuperando tu equilibrio",
  whatsapp: "5490000000000",
  whatsappDisplay: "000 000-0000",
  instagram: "https://www.instagram.com/",
  address: "Av. Siempre Viva 123",
  city: "Córdoba, Capital",
  mapQuery: "Plaza San Martín, Córdoba, Argentina",
  timezone: "America/Argentina/Buenos_Aires",
  heroBadge: "Quiropráctica · Consultorio de ejemplo",
  intro:
    "Soy la Lic. Ana Ejemplo, quiropráctica. Evalúo tu caso, te explico qué te pasa y trabajamos juntos para que vuelvas a moverte sin dolor. Este texto es de ejemplo: acá va la presentación de tu consultorio.",
};

export const BUSINESS: typeof REAL = IS_DEMO ? DEMO : REAL;

export function waLink(text?: string) {
  const base = `https://wa.me/${BUSINESS.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
