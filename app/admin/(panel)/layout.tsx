import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../actions";
import { isAdmin } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const P = await getProfile();
  return { title: `Panel | ${P.name}`, robots: { index: false, follow: false } };
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const P = await getProfile();

  const links = [
    { href: "/admin", label: "Agenda" },
    { href: "/admin/nuevo", label: "Nuevo turno" },
    { href: "/admin/horarios", label: "Horarios" },
  ];

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <span className="font-serif text-lg font-semibold">{P.name}</span>
          <nav aria-label="Panel" className="flex flex-wrap items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-sea-soft">
                {l.label}
              </Link>
            ))}
            <Link href="/" className="rounded-full px-4 py-2 text-sm text-ink-soft hover:bg-sea-soft">
              Ver sitio
            </Link>
            <form action={logout}>
              <button className="rounded-full px-4 py-2 text-sm text-ink-soft hover:bg-sea-soft">Salir</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
