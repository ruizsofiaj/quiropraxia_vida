import Link from "next/link";
import { SiteFooter, SiteHeader, WhatsAppFab } from "@/components/SiteChrome";
import { isAdmin } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // La barra de arriba aparece solo si Hugo ya inició sesión en el panel.
  const admin = await isAdmin();
  return (
    <>
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
