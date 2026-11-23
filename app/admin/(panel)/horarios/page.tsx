import { addBlock, deleteBlock, saveHours, saveRules, saveServices } from "../../actions";
import { readDB } from "@/lib/store";
import { artParts, fmtDateStrLong, todayArt, WEEKDAYS } from "@/lib/time";

const OK: Record<string, string> = {
  horarios: "Horarios guardados.",
  reglas: "Reglas guardadas.",
  servicios: "Consultas guardadas.",
  bloqueo: "Bloqueos actualizados.",
  "bloqueo-error": "Revisá las fechas del bloqueo.",
};

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const db = await readDB();
  const s = db.settings;
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Horarios y reglas</h1>
        {ok && (
          <p role="status" className={`mt-3 rounded-xl p-3 text-sm ${ok.includes("error") ? "bg-red-50 text-danger" : "bg-sea-soft"}`}>
            {OK[ok]}
          </p>
        )}
      </div>

      <section>
        <h2 className="text-xl font-semibold">Horarios de atención</h2>
        <p className="text-sm text-ink-soft">Hasta dos franjas por día (por ejemplo mañana y tarde).</p>
        <form action={saveHours} className="card mt-3 space-y-3">
          {order.map((d) => {
            const h = s.weekly[d];
            const r1 = h.ranges[0];
            const r2 = h.ranges[1];
            return (
              <div key={d} className="grid items-center gap-2 border-b border-line pb-3 last:border-0 last:pb-0 md:grid-cols-[140px_1fr_1fr]">
                <label className="flex items-center gap-2 font-semibold capitalize">
                  <input type="checkbox" name={`open_${d}`} defaultChecked={h.open} className="h-5 w-5 accent-[var(--sea)]" />
                  {WEEKDAYS[d]}
                </label>
                {[[1, r1], [2, r2]].map(([i, r]) => (
                  <div key={String(i)} className="flex items-center gap-2">
                    <input aria-label={`${WEEKDAYS[d]} franja ${i} desde`} type="time" name={`s${i}_${d}`} defaultValue={(r as typeof r1)?.start ?? ""} className="field" />
                    <span>a</span>
                    <input aria-label={`${WEEKDAYS[d]} franja ${i} hasta`} type="time" name={`e${i}_${d}`} defaultValue={(r as typeof r1)?.end ?? ""} className="field" />
                  </div>
                ))}
              </div>
            );
          })}
          <button className="btn btn-primary">Guardar horarios</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Reglas de reserva</h2>
        <form action={saveRules} className="card mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["bufferMin", "Margen entre turnos (min)", s.bufferMin],
            ["minNoticeHours", "Anticipación mínima (horas)", s.minNoticeHours],
            ["maxDays", "Reservar hasta (días adelante)", s.maxDays],
            ["cancelLimitHours", "Cancelar o mover hasta (horas antes)", s.cancelLimitHours],
            ["stepMin", "Intervalo entre horarios (min)", s.stepMin],
          ].map(([name, label, value]) => (
            <div key={String(name)}>
              <label className="label" htmlFor={String(name)}>{label}</label>
              <input id={String(name)} name={String(name)} type="number" min={0} defaultValue={Number(value)} className="field" />
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3">
            <button className="btn btn-primary">Guardar reglas</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Consultas y precios</h2>
        <form action={saveServices} className="card mt-3 space-y-5">
          <input type="hidden" name="count" value={db.services.length} />
          {db.services.map((svc, i) => (
            <div key={svc.id} className="grid gap-3 border-b border-line pb-5 sm:grid-cols-[1fr_110px_150px]">
              <input type="hidden" name={`id_${i}`} value={svc.id} />
              <div>
                <label className="label" htmlFor={`name_${i}`}>Nombre</label>
                <input id={`name_${i}`} name={`name_${i}`} defaultValue={svc.name} className="field" />
              </div>
              <div>
                <label className="label" htmlFor={`duration_${i}`}>Minutos</label>
                <input id={`duration_${i}`} name={`duration_${i}`} type="number" defaultValue={svc.durationMin} className="field" />
              </div>
              <div>
                <label className="label" htmlFor={`price_${i}`}>Precio</label>
                <input id={`price_${i}`} name={`price_${i}`} defaultValue={svc.priceLabel} className="field" />
              </div>
              <div className="sm:col-span-3">
                <label className="label" htmlFor={`description_${i}`}>Descripción</label>
                <input id={`description_${i}`} name={`description_${i}`} defaultValue={svc.description} className="field" />
              </div>
            </div>
          ))}
          <div>
            <p className="font-semibold">Agregar una consulta nueva</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_110px_150px]">
              <input aria-label="Nombre nueva consulta" name="new_name" placeholder="Nombre" className="field" />
              <input aria-label="Minutos nueva consulta" name="new_duration" type="number" placeholder="Min" className="field" />
              <input aria-label="Precio nueva consulta" name="new_price" placeholder="Precio" className="field" />
              <input aria-label="Descripción nueva consulta" name="new_description" placeholder="Descripción" className="field sm:col-span-3" />
            </div>
          </div>
          <button className="btn btn-primary">Guardar consultas</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Días bloqueados</h2>
        <p className="text-sm text-ink-soft">Vacaciones, congresos o cualquier día que no atiendas.</p>
        <ul className="mt-3 space-y-2">
          {db.blocks.map((b) => (
            <li key={b.id} className="card flex items-center justify-between gap-3 !p-3">
              <span className="text-sm">
                <strong>{fmtDateStrLong(artParts(new Date(b.startISO)).date)}</strong>
                {" a "}
                <strong>{fmtDateStrLong(artParts(new Date(new Date(b.endISO).getTime() - 1)).date)}</strong>
                {" · "}{b.reason}
              </span>
              <form action={deleteBlock}>
                <input type="hidden" name="id" value={b.id} />
                <button className="btn btn-danger !min-h-10 !px-4 text-sm">Quitar</button>
              </form>
            </li>
          ))}
          {db.blocks.length === 0 && <li className="text-sm text-ink-soft">No hay bloqueos.</li>}
        </ul>
        <form action={addBlock} className="card mt-3 grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label" htmlFor="from">Desde</label>
            <input id="from" name="from" type="date" required min={todayArt()} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="to">Hasta (opcional)</label>
            <input id="to" name="to" type="date" min={todayArt()} className="field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="breason">Motivo</label>
            <input id="breason" name="reason" placeholder="Vacaciones" className="field" />
          </div>
          <div className="sm:col-span-4">
            <button className="btn btn-primary">Bloquear</button>
          </div>
        </form>
      </section>
    </div>
  );
}
