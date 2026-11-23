import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { login } from "../actions";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Ingresar | Panel",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="grid flex-1 place-items-center px-4 py-16">
      <form action={login} className="card w-full max-w-sm space-y-4 !p-8">
        <h1 className="text-3xl font-semibold">Panel de turnos</h1>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            Contraseña incorrecta.
          </p>
        )}
        <button className="btn btn-primary w-full">Ingresar</button>
      </form>
    </div>
  );
}
