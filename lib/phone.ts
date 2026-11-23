// Arma un link de WhatsApp a partir de un teléfono cargado por el paciente (formato argentino).
export function waLinkTo(phone: string, text?: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (!d.startsWith("54")) {
    d = d.replace(/^0/, "");
    if (d.length > 10) d = d.replace(/^(\d{2,4})15/, "$1"); // saca el 15 solo si sobran dígitos
    d = `549${d}`;
  } else if (!d.startsWith("549")) {
    d = `549${d.slice(2)}`;
  }
  const base = `https://wa.me/${d}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
