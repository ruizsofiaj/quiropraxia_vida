import Link from "next/link";
import { headers } from "next/headers";
import { adminCancel } from "../actions";
import { ConfirmWhatsApp } from "@/components/ConfirmWhatsApp";
import { ChevronLeftIcon, ChevronRightIcon, WhatsAppIcon } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { addMonths, isMonthStr, monthLabel, monthWeeks, WEEK_HEADERS } from "@/lib/calendar";
import { waLinkTo } from "@/lib/phone";
import { readDB } from "@/lib/store";
import { artParts, dowOf, fmtDateLong, fmtDateStrLong, fmtTime, isDateStr, todayArt } from "@/lib/time";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; fecha?: string }>;
}) {
  const sp = await searchParams;
  const today = todayArt();
  const mes = isMonthStr(sp.mes) ? sp.mes : isDateStr(sp.fecha) ? sp.fecha.slice(0, 7) : today.slice(0, 7);
  const selected =
    isDateStr(sp.fecha) && sp.fecha.startsWith(mes) ? sp.fecha : mes === today.slice(0, 7) ? today : `${mes}-01`;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const origin = `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;

  const db = await readDB();
  const byDay = new Map<string, typeof db.appointments>();
  for (const a of db.appointments) {
    if (a.status !== "confirmed") continue;
    const d = artParts(new Date(a.startISO)).date;
    byDay.set(d, [...(byDay.get(d) ?? []), a]);
  }
  for (const list of byDay.values()) list.sort((a, b) => a.startISO.localeCompare(b.startISO));

  // Turnos futuros que Hugo todavía no confirmó, en cualquier fecha (no solo el mes que se está viendo).
  const nowMs = new Date().getTime();
  const pending = db.appointments.filter(
    (a) => a.status === "confirmed" && !a.confirmedAt && new Date(a.endISO).getTime() > nowMs,
  ).length;

  const blocksFor = (d: string) =>
    db.blocks.filter((b) => {
      const s = artParts(new Date(b.startISO)).date;
      const e = artParts(new Date(new Date(b.endISO).getTime() - 1)).date;
      return s <= d && d <= e;
    });
  const isClosedDay = (d: string) => {
    const w = db.settings.weekly[dowOf(d)];
    return !w?.open || w.ranges.length === 0;
  };

  const q = (m: string, fecha?: string) => `/admin?mes=${m}${fecha ? `&fecha=${fecha}` : ""}`;
  const weeks = monthWeeks(mes);
  const dayList = byDay.get(selected) ?? [];
  const dayBlocks = blocksFor(selected);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Agenda</h1>
        <div className="flex items-center gap-2">
          <Link className="btn btn-ghost !min-h-10 !px-4 text-sm" href={q(today.slice(0, 7), today)}>
            Hoy
          </Link>
          <Link href={q(addMonths(mes, -1))} aria-label="Mes anterior" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white hover:bg-sea-soft">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <p className="min-w-36 text-center font-serif text-lg font-semibold">{monthLabel(mes)}</p>
          <Link href={q(addMonths(mes, 1))} aria-label="Mes siguiente" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white hover:bg-sea-soft">
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {pending > 0 && (
        <p role="status" className="mt-4 rounded-xl bg-sand-deep px-4 py-3 text-sm font-medium">
          Tenés {pending} {pending === 1 ? "turno" : "turnos"} sin confirmar por WhatsApp.
        </p>
      )}

      {/* Calendario del mes */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="grid grid-cols-7 border-b border-line bg-sand-deep/50 text-center text-xs font-semibold uppercase text-ink-soft">
          {WEEK_HEADERS.map((w, i) => (
            <span key={i} className="py-2" aria-label={w.long}>
              <span className="md:hidden">{w.short}</span>
              <span className="hidden md:inline">{w.long.slice(0, 3)}</span>
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((d, i) => {
            const border = "border-b border-r border-line [&:nth-child(7n)]:border-r-0";
            if (!d) return <div key={`e${i}`} className={`${border} min-h-14 bg-sand/60 md:min-h-28`} />;
            const list = byDay.get(d) ?? [];
            const blocked = blocksFor(d).length > 0;
            const closed = isClosedDay(d);
            const isSel = d === selected;
            const isToday = d === today;
            return (
              <Link
                key={d}
                href={q(mes, d)}
                scroll={false}
                aria-label={`${fmtDateStrLong(d)}: ${list.length} ${list.length === 1 ? "turno" : "turnos"}${blocked ? ", bloqueado" : ""}`}
                aria-current={isSel ? "date" : undefined}
                className={`${border} relative flex min-h-14 flex-col p-1 transition-colors hover:bg-sea-soft/60 md:min-h-28 md:p-1.5 ${
                  blocked ? "bg-sand-deep" : closed ? "bg-sand/60 text-ink-soft" : ""
                } ${isSel ? "z-10 outline outline-2 -outline-offset-2 outline-sea" : ""}`}
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold md:h-7 md:w-7 md:text-sm ${
                    isToday ? "bg-ink text-white" : ""
                  }`}
                >
                  {Number(d.slice(8))}
                </span>

                {/* Celular: puntitos de color. Escritorio: los turnos con su hora. */}
                {list.length > 0 && (
                  <span className="mt-1 flex flex-wrap gap-0.5 md:hidden">
                    {list.slice(0, 4).map((a) => (
                      <span key={a.id} className={`h-2 w-2 rounded-full ${a.confirmedAt ? "bg-ok" : "bg-orange"}`} />
                    ))}
                  </span>
                )}
                <span className="mt-1 hidden flex-col gap-0.5 md:flex">
                  {blocked && <span className="truncate rounded bg-ink/10 px-1.5 py-0.5 text-xs">Bloqueado</span>}
                  {list.slice(0, 3).map((a) => (
                    <span
                      key={a.id}
                      className={`truncate rounded px-1.5 py-0.5 text-xs font-medium ${
                        a.confirmedAt ? "bg-green-100 text-ok" : "bg-orange/80 text-ink"
                      }`}
                    >
                      {fmtTime(a.startISO)} {a.name.split(" ")[0]}
                    </span>
                  ))}
                  {list.length > 3 && <span className="px-1 text-xs text-ink-soft">+{list.length - 3} más</span>}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ok" /> Confirmado</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange" /> Sin confirmar</span>
        <span>Los días en gris no tienen atención.</span>
      </p>

      {/* Detalle del día elegido */}
      <section aria-labelledby="dia-elegido" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="dia-elegido" className="text-xl font-semibold first-letter:uppercase">
            {fmtDateStrLong(selected)}
            {selected === today && <span className="ml-2 rounded-full bg-clay px-2 py-0.5 text-xs text-white">Hoy</span>}
          </h2>
          <Link href={`/admin/nuevo?fecha=${selected}`} className="btn btn-ghost !min-h-10 !px-4 text-sm">
            Cargar turno este día
          </Link>
        </div>

        {dayBlocks.map((b) => (
          <p key={b.id} className="mt-2 rounded-xl bg-sand-deep px-4 py-2 text-sm">
            Bloqueado: {b.reason}
          </p>
        ))}

        {dayList.length === 0 && dayBlocks.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Sin turnos este día.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {dayList.map((a) => {
              const svc = db.services.find((s) => s.id === a.serviceId);
              return (
                <li key={a.id} className="card flex flex-wrap items-start justify-between gap-3 !p-4">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {fmtTime(a.startISO)} a {fmtTime(a.endISO)} · {a.name}
                      {a.confirmedAt ? (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-ok">
                          ✓ Confirmado
                        </span>
                      ) : (
                        <span className="ml-2 rounded-full bg-orange px-2 py-0.5 text-xs font-semibold text-ink">
                          Sin confirmar
                        </span>
                      )}
                      {a.source === "manual" && (
                        <span className="ml-2 rounded-full bg-sand-deep px-2 py-0.5 text-xs font-normal">cargado a mano</span>
                      )}
                    </p>
                    <p className="text-sm text-ink-soft">{svc?.name} · {a.phone}</p>
                    {a.reason && <p className="mt-1 text-sm">Motivo: {a.reason}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ConfirmWhatsApp
                      token={a.token}
                      name={a.name}
                      confirmed={Boolean(a.confirmedAt)}
                      href={waLinkTo(
                        a.phone,
                        `Hola ${a.name.split(" ")[0]}, soy el ${BUSINESS.professional}. Tu turno de ${svc?.name ?? "consulta"} está confirmado para el ${fmtDateLong(a.startISO)} a las ${fmtTime(a.startISO)} hs en ${BUSINESS.address}, ${BUSINESS.city}.\n\nSi necesitás cancelarlo o moverlo, entrá acá: ${origin}/turno/${a.token}`,
                      )}
                    />
                    <a
                      href={waLinkTo(
                        a.phone,
                        `Hola ${a.name.split(" ")[0]}, te recuerdo tu turno de ${svc?.name ?? "consulta"} el ${fmtDateLong(a.startISO)} a las ${fmtTime(a.startISO)} hs en ${BUSINESS.address}, ${BUSINESS.city}. ¡Te espero! ${BUSINESS.professional}`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Enviar recordatorio por WhatsApp a ${a.name}`}
                      className="btn btn-ghost !min-h-10 !px-4 text-sm"
                    >
                      <WhatsAppIcon className="h-5 w-5" /> Recordatorio
                    </a>
                    <form action={adminCancel}>
                      <input type="hidden" name="token" value={a.token} />
                      <button className="btn btn-danger !min-h-10 !px-4 text-sm">Cancelar</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
