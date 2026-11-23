import type { DB } from "./types";
import {
  addDays,
  artToDate,
  dowOf,
  hhmmToMinutes,
  isDateStr,
  todayArt,
} from "./time";

const MIN = 60_000;

export function hasConflict(
  db: DB,
  startMs: number,
  endMs: number,
  ignoreToken?: string,
): boolean {
  const buffer = db.settings.bufferMin * MIN;
  for (const a of db.appointments) {
    if (a.status !== "confirmed" || a.token === ignoreToken) continue;
    const aStart = new Date(a.startISO).getTime();
    const aEnd = new Date(a.endISO).getTime();
    if (startMs < aEnd + buffer && aStart < endMs + buffer) return true;
  }
  for (const b of db.blocks) {
    const bStart = new Date(b.startISO).getTime();
    const bEnd = new Date(b.endISO).getTime();
    if (startMs < bEnd && bStart < endMs) return true;
  }
  return false;
}

// Devuelve los inicios libres (ISO) de un día para un servicio.
export function computeSlots(
  db: DB,
  serviceId: string,
  dateStr: string,
  now = new Date(),
  ignoreToken?: string,
): string[] {
  if (!isDateStr(dateStr)) return [];
  const service = db.services.find((s) => s.id === serviceId);
  if (!service) return [];

  const today = todayArt(now);
  const last = addDays(today, db.settings.maxDays);
  if (dateStr < today || dateStr > last) return [];

  const hours = db.settings.weekly[dowOf(dateStr)];
  if (!hours?.open) return [];

  const earliest = now.getTime() + db.settings.minNoticeHours * 60 * MIN;
  const slots: string[] = [];

  for (const range of hours.ranges) {
    const from = hhmmToMinutes(range.start);
    const to = hhmmToMinutes(range.end);
    for (let t = from; t + service.durationMin <= to; t += db.settings.stepMin) {
      const start = artToDate(dateStr, t);
      const startMs = start.getTime();
      const endMs = startMs + service.durationMin * MIN;
      if (startMs < earliest) continue;
      if (hasConflict(db, startMs, endMs, ignoreToken)) continue;
      slots.push(start.toISOString());
    }
  }
  return slots;
}
