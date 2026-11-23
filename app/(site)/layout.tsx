import Link from "next/link";
import { SiteFooter, SiteHeader, WhatsAppFab } from "@/components/SiteChrome";
import { isAdmin } from "@/lib/auth";
import { DEMO_CONTACT_WHATSAPP, IS_DEMO } from "@/lib/demo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // La barra de arriba aparece solo si Hugo ya inició sesión en el panel.
  const admin = await isAdmin();
  return (
    <>
      {IS_DEMO && (
        <div className="bg-orange text-ink">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 text-sm sm:px-6">
            <p className="font-medium">
              Demo con datos de ejemplo. Reservá un turno como paciente y mirá el panel del profesional en{" "}
              <Link href="/admin" className="font-bold underline">
                /admin
              </Link>{" "}
              (contraseña: <code className="rounded bg-white/60 px-1">{process.env.ADMIN_PASSWORD}</code>).
            </p>
            {DEMO_CONTACT_WHATSAPP && (
              <a
                href={`https://wa.me/${DEMO_CONTACT_WHATSAPP}?text=${encodeURIComponent("Hola, vi la demo del sistema de turnos y me interesa para mi consultorio.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 font-semibold text-sand hover:bg-black"
              >
                Quiero este sistema
              </a>
            )}
          </div>
        </div>
      )}
      {admin && (
        <div className="bg-ink text-sand">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6">
            <span className="hidden sm:inline">Estás viendo el sitio como administrador.</span>
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-orange px-4 font-semibold text-ink hover:bg-[#ffa246]"
            >
              <span aria-hidden>←</span> Volver al panel
            </Link>
          </div>
        </div>
      )}
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFab />
    </>
  );
}
