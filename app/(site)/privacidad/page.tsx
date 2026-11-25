import type { Metadata } from "next";
import { getProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  const P = await getProfile();
  return { title: `Política de privacidad | ${P.name}` };
}

/*
  BORRADOR: el negocio debe revisarlo con quien corresponda antes de publicar.
  Referencia: Ley 25.326 de Protección de Datos Personales (Argentina).
  Completar: razón social o nombre completo del responsable, y domicilio.
*/
export default async function PrivacidadPage() {
  const P = await getProfile();
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold">Política de privacidad</h1>
      <p className="rounded-xl bg-sea-soft p-3 text-sm">
        Borrador para revisión. Falta completar los datos del responsable.
      </p>

      <section>
        <h2 className="text-2xl font-semibold">Quién es responsable de tus datos</h2>
        <p className="mt-2 text-ink-soft">
          {P.professional} ({P.name}). Domicilio: {P.address}. Contacto por WhatsApp: +{P.whatsapp}.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Qué datos pedimos y para qué</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-ink-soft">
          <li>Nombre y WhatsApp: para reservar tu turno y escribirte si hay cambios o un recordatorio.</li>
          <li>{P.privacyNote}</li>
        </ul>
        <p className="mt-2 text-ink-soft">
          No usamos tus datos para publicidad ni los compartimos con terceros, salvo los proveedores
          técnicos necesarios para que el sistema funcione (hosting y base de datos).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Tus derechos</h2>
        <p className="mt-2 text-ink-soft">
          Podés pedir acceso, rectificación o eliminación de tus datos escribiendo por WhatsApp. La Agencia
          de Acceso a la Información Pública es el órgano de control de la Ley 25.326 y atiende denuncias y
          reclamos por incumplimientos.
        </p>
      </section>
    </article>
  );
}
