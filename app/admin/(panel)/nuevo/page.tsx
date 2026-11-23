import { adminCreate } from "../../actions";
import { readDB } from "@/lib/store";
import { isDateStr, todayArt } from "@/lib/time";

const ERRORS: Record<string, string> = {
  datos: "Revisá los datos: falta fecha, hora, nombre o servicio.",
  ocupado: "Ese horario se pisa con otro turno o con un bloqueo.",
};

export default async function NuevoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; fecha?: string }>;
}) {
  const { error, fecha } = await searchParams;
  const defaultDate = isDateStr(fecha) && fecha >= todayArt() ? fecha : undefined;
  const db = await readDB();

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold">Nuevo turno</h1>
      <p className="mt-2 text-ink-soft">
        Para turnos que te piden por WhatsApp o en persona. Acá podés cargar cualquier horario, aunque
        esté fuera de tu agenda habitual.
      </p>

      <form action={adminCreate} className="card mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="serviceId">Consulta</label>
          <select id="serviceId" name="serviceId" required className="field">
            {db.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMin} min)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">Día</label>
          <input id="date" name="date" type="date" required min={todayArt()} defaultValue={defaultDate} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="time">Hora</label>
          <input id="time" name="time" type="time" step={300} required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="name">Nombre y apellido</label>
          <input id="name" name="name" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="phone">WhatsApp</label>
          <input id="phone" name="phone" type="tel" className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="reason">Motivo (opcional)</label>
          <textarea id="reason" name="reason" rows={2} className="field" />
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger sm:col-span-2">
            {ERRORS[error] ?? ERRORS.datos}
          </p>
        )}
        <div className="sm:col-span-2">
          <button className="btn btn-primary">Cargar turno</button>
        </div>
      </form>
    </div>
  );
}
