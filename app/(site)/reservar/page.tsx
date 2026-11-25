import type { Metadata } from "next";
import { BookingFlow } from "@/components/BookingFlow";
import { getProfile, waLink } from "@/lib/profile";
import { readDB } from "@/lib/store";
import { todayArt } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const P = await getProfile();
  return { title: `Reservar turno | ${P.name}` };
}

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ reprogramar?: string }>;
}) {
  const P = await getProfile();
  const { reprogramar } = await searchParams;
  const db = await readDB();

  const openDows = db.settings.weekly
    .map((d, i) => (d.open && d.ranges.length ? i : -1))
    .filter((i) => i >= 0);

  const current = reprogramar
    ? db.appointments.find((a) => a.token === reprogramar && a.status === "confirmed")
    : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold sm:text-5xl">
        {current ? "Mové tu turno" : "Reservá tu turno"}
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Elegí qué necesitás, el día y un horario libre. Es gratis y recibís la confirmación al instante.
      </p>
      <div className="mt-10">
        <BookingFlow
          services={db.services}
          openDows={openDows}
          today={todayArt()}
          maxDays={db.settings.maxDays}
          labels={{
            servicePrompt: `¿Qué ${P.vocab.service} necesitás?`,
            noteLabel: P.msg.noteLabel,
            noteVisibleTo: P.msg.noteVisibleTo,
            writeToUs: P.msg.writeToUs.charAt(0).toLowerCase() + P.msg.writeToUs.slice(1),
            writeHref: waLink(P, P.msg.waNoSlot),
          }}
          reschedule={
            current
              ? {
                  token: current.token,
                  serviceId: current.serviceId,
                  name: current.name,
                  phone: current.phone,
                  reason: current.reason ?? "",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
