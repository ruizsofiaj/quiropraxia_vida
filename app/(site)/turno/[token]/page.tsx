import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelBooking } from "@/app/actions";
import { CheckIcon, MapPinIcon } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { readDB } from "@/lib/store";
import { fmtDateLong, fmtTime, hoursUntil } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `Tu turno | ${BUSINESS.name}`,
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  late: `Ya falta poco para tu turno, así que no se puede cancelar desde acá. Escribile a ${BUSINESS.firstName} por WhatsApp.`,
  "not-found": "No pudimos cancelar este turno.",
};

export default async function TurnoPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ nuevo?: string; error?: string }>;
}) {
  const { token } = await params;
  const { nuevo, error } = await searchParams;
  const db = await readDB();
  const appt = db.appointments.find((a) => a.token === token);
  if (!appt) notFound();

  const service = db.services.find((s) => s.id === appt.serviceId);
  const cancelled = appt.status === "cancelled";
  const when = `${fmtDateLong(appt.startISO)}, ${fmtTime(appt.startISO)} hs`;
  const hoursLeft = hoursUntil(appt.startISO);
  const canManage = !cancelled && hoursLeft >= db.settings.cancelLimitHours;
  const past = hoursLeft < 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="card !p-8">
        <span
          className={`grid h-14 w-14 place-items-center rounded-full ${
            cancelled ? "bg-red-100 text-danger" : "bg-sea-soft text-sea"
          }`}
        >
          <CheckIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-3xl font-semibold">
          {cancelled
            ? "Turno cancelado"
            : nuevo
              ? "¡Listo! Tu turno está confirmado"
              : "Tu turno"}
        </h1>

        <dl className="mt-6 space-y-3">
          <div>
            <dt className="text-sm text-ink-soft">Consulta</dt>
            <dd className="font-semibold">{service?.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Cuándo</dt>
            <dd className={`font-semibold first-letter:uppercase ${cancelled ? "line-through" : ""}`}>{when}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Dónde</dt>
            <dd className="flex items-start gap-2 font-semibold">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-sea" /> {BUSINESS.address}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">A nombre de</dt>
            <dd className="font-semibold">{appt.name}</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-red-50 p-3 text-sm text-danger">
            {ERRORS[error] ?? ERRORS["not-found"]}
          </p>
        )}

        {!cancelled && nuevo && (
          <p className="mt-6 rounded-xl bg-sea-soft p-4 text-sm">
            {BUSINESS.firstName} te va a escribir por WhatsApp al número que dejaste para confirmarte el turno.
          </p>
        )}

        {canManage && !past && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href={`/reservar?reprogramar=${token}`} className="btn btn-ghost flex-1">
              Mover turno
            </Link>
            <form action={cancelBooking} className="flex-1">
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="btn btn-danger w-full">
                Cancelar turno
              </button>
            </form>
          </div>
        )}

        {!cancelled && !canManage && !past && (
          <p className="mt-4 text-sm text-ink-soft">
            Se puede cancelar o mover hasta {db.settings.cancelLimitHours} horas antes. Ahora escribile a
            {BUSINESS.firstName} por WhatsApp.
          </p>
        )}

        <p className="mt-6 text-sm text-ink-soft">
          Guardá esta página: es tu link para gestionar el turno.
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm font-semibold text-sea underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
