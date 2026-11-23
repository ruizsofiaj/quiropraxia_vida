// Datos del negocio. Fuente: assets/datos.txt, el logo y la bio de Instagram.
export const BUSINESS = {
  name: "Quiropraxia & Vida",
  professional: "Lic. Hugo Rodríguez",
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
} as const;

export function waLink(text?: string) {
  const base = `https://wa.me/${BUSINESS.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
