import { TABLE_PREFIX } from "./demo";
import { SEED } from "./seed";
import type { Appointment, Block, DB, Service, Settings } from "./types";

/*
  Almacenamiento de producción: Supabase (Postgres) vía su API REST, solo desde el servidor
  con la service role key. Las tablas están en supabase/schema.sql.
  Misma interfaz que el archivo local: se lee todo y updateDB guarda solo lo que cambió.
  La restricción no_overlap de la base impide dos turnos confirmados superpuestos,
  aunque dos reservas lleguen a la vez desde instancias distintas.
*/

export class DbError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

function cfg() {
  const url = process.env.SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DbError("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  return { url, key };
}

async function rest<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<T> {
  const { url, key } = cfg();
  // El path siempre empieza con el nombre de la tabla; la demo usa tablas con prefijo (demo_...).
  const res = await fetch(`${url}/rest/v1/${TABLE_PREFIX}${path}`, {
    method: init.method ?? "GET",
    cache: "no-store",
    headers: {
      apikey: key,
      // Las claves nuevas (sb_secret_...) no son JWT: van solo en apikey. La clave legacy va también como Bearer.
      ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }),
      "Content-Type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) {
    let code: string | undefined;
    let message = `Supabase ${res.status}`;
    try {
      const j = await res.json();
      code = j.code;
      message = j.message ?? message;
    } catch {}
    throw new DbError(message, code);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

type ApptRow = {
  id: string;
  token: string;
  service_id: string;
  start_at: string;
  end_at: string;
  name: string;
  phone: string;
  reason: string | null;
  status: "confirmed" | "cancelled";
  source: "web" | "manual";
  created_at: string;
  confirmed_at: string | null;
  reminder_sent_at: string | null;
};
type ServiceRow = {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  price_label: string;
};
type SettingsRow = {
  id: number;
  weekly: Settings["weekly"];
  buffer_min: number;
  min_notice_hours: number;
  max_days: number;
  cancel_limit_hours: number;
  step_min: number;
};
type BlockRow = { id: string; start_at: string; end_at: string; reason: string };

const iso = (v: string) => new Date(v).toISOString();

const fromAppt = (r: ApptRow): Appointment => ({
  id: r.id,
  token: r.token,
  serviceId: r.service_id,
  startISO: iso(r.start_at),
  endISO: iso(r.end_at),
  name: r.name,
  phone: r.phone,
  reason: r.reason ?? undefined,
  status: r.status,
  source: r.source,
  createdAt: iso(r.created_at),
  confirmedAt: r.confirmed_at ? iso(r.confirmed_at) : undefined,
  reminderSentAt: r.reminder_sent_at ? iso(r.reminder_sent_at) : undefined,
});
const toAppt = (a: Appointment): ApptRow => ({
  id: a.id,
  token: a.token,
  service_id: a.serviceId,
  start_at: a.startISO,
  end_at: a.endISO,
  name: a.name,
  phone: a.phone,
  reason: a.reason ?? null,
  status: a.status,
  source: a.source,
  created_at: a.createdAt,
  confirmed_at: a.confirmedAt ?? null,
  reminder_sent_at: a.reminderSentAt ?? null,
});
const fromService = (r: ServiceRow): Service => ({
  id: r.id,
  name: r.name,
  description: r.description,
  durationMin: r.duration_min,
  priceLabel: r.price_label,
});
const toService = (s: Service): ServiceRow => ({
  id: s.id,
  name: s.name,
  description: s.description,
  duration_min: s.durationMin,
  price_label: s.priceLabel,
});
const fromSettings = (r: SettingsRow): Settings => ({
  weekly: r.weekly,
  bufferMin: r.buffer_min,
  minNoticeHours: r.min_notice_hours,
  maxDays: r.max_days,
  cancelLimitHours: r.cancel_limit_hours,
  stepMin: r.step_min,
});
const toSettings = (s: Settings): SettingsRow => ({
  id: 1,
  weekly: s.weekly,
  buffer_min: s.bufferMin,
  min_notice_hours: s.minNoticeHours,
  max_days: s.maxDays,
  cancel_limit_hours: s.cancelLimitHours,
  step_min: s.stepMin,
});
const fromBlock = (r: BlockRow): Block => ({
  id: r.id,
  startISO: iso(r.start_at),
  endISO: iso(r.end_at),
  reason: r.reason,
});
const toBlock = (b: Block): BlockRow => ({
  id: b.id,
  start_at: b.startISO,
  end_at: b.endISO,
  reason: b.reason,
});

const UPSERT = "resolution=merge-duplicates,return=minimal";

async function load(): Promise<DB> {
  const [settings, services, blocks, appointments] = await Promise.all([
    rest<SettingsRow[]>("settings?select=*&id=eq.1"),
    rest<ServiceRow[]>("services?select=*&order=name.asc"),
    rest<BlockRow[]>("blocks?select=*&order=start_at.asc"),
    rest<ApptRow[]>("appointments?select=*&order=start_at.asc&limit=5000"),
  ]);

  // Primera vez: carga los datos iniciales de Hugo.
  if (settings.length === 0) {
    await rest("settings", { method: "POST", body: toSettings(SEED.settings), prefer: UPSERT });
    if (services.length === 0) {
      await rest("services", { method: "POST", body: SEED.services.map(toService), prefer: UPSERT });
      return structuredClone({ ...SEED, blocks: [], appointments: [] });
    }
    return { settings: SEED.settings, services: services.map(fromService), blocks: blocks.map(fromBlock), appointments: appointments.map(fromAppt) };
  }

  return {
    settings: fromSettings(settings[0]),
    services: services.map(fromService),
    blocks: blocks.map(fromBlock),
    appointments: appointments.map(fromAppt),
  };
}

export async function readSupabaseDB(): Promise<DB> {
  return load();
}

let queue: Promise<unknown> = Promise.resolve();

function changed<T extends { id: string }>(before: Map<string, string>, rows: T[]): T[] {
  return rows.filter((r) => before.get(r.id) !== JSON.stringify(r));
}

export function updateSupabaseDB<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const snap = {
      settings: JSON.stringify(db.settings),
      services: new Map(db.services.map((s) => [s.id, JSON.stringify(s)])),
      blocks: new Map(db.blocks.map((b) => [b.id, JSON.stringify(b)])),
      appointments: new Map(db.appointments.map((a) => [a.id, JSON.stringify(a)])),
    };

    const result = await fn(db);

    if (JSON.stringify(db.settings) !== snap.settings) {
      await rest("settings", { method: "POST", body: toSettings(db.settings), prefer: UPSERT });
    }
    const services = changed(snap.services, db.services);
    if (services.length) {
      await rest("services", { method: "POST", body: services.map(toService), prefer: UPSERT });
    }
    const removed = [...snap.blocks.keys()].filter((id) => !db.blocks.some((b) => b.id === id));
    if (removed.length) {
      await rest(`blocks?id=in.(${removed.join(",")})`, { method: "DELETE" });
    }
    const blocks = changed(snap.blocks, db.blocks);
    if (blocks.length) {
      await rest("blocks", { method: "POST", body: blocks.map(toBlock), prefer: UPSERT });
    }
    const appts = changed(snap.appointments, db.appointments);
    if (appts.length) {
      await rest("appointments", { method: "POST", body: appts.map(toAppt), prefer: UPSERT });
    }
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
