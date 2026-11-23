"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, isAdmin } from "@/lib/auth";
import { hasConflict } from "@/lib/availability";
import { isOverlapError, updateDB } from "@/lib/store";
import { artToDate, hhmmToMinutes, isDateStr } from "@/lib/time";
import type { Appointment, DayHours } from "@/lib/types";

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

function str(v: FormDataEntryValue | null, max = 200) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function num(v: FormDataEntryValue | null, fallback: number, min: number, max: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function login(formData: FormData) {
  const ok = checkPassword(str(formData.get("password"), 100));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // frena la fuerza bruta
    redirect("/admin/login?error=1");
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function adminCancel(formData: FormData) {
  await guard();
  const token = str(formData.get("token"), 80);
  await updateDB((db) => {
    const a = db.appointments.find((x) => x.token === token);
    if (a) a.status = "cancelled";
  });
  revalidatePath("/admin");
}

// Se llama al apretar "Confirmar" (que abre WhatsApp): deja marcado que Hugo ya le escribió al paciente.
export async function markConfirmed(token: string) {
  await guard();
  await updateDB((db) => {
    const a = db.appointments.find((x) => x.token === token);
    if (a && a.status === "confirmed" && !a.confirmedAt) a.confirmedAt = new Date().toISOString();
  });
  revalidatePath("/admin");
}

export async function adminCreate(formData: FormData) {
  await guard();
  const serviceId = str(formData.get("serviceId"), 60);
  const date = str(formData.get("date"), 10);
  const time = str(formData.get("time"), 5);
  const name = str(formData.get("name"), 80);
  const phone = str(formData.get("phone"), 30).replace(/[^\d+]/g, "");
  const reason = str(formData.get("reason"), 500);

  if (!isDateStr(date) || !HHMM.test(time) || name.length < 2 || !serviceId)
    redirect("/admin/nuevo?error=datos");

  const start = artToDate(date, hhmmToMinutes(time));

  const result = await updateDB((db) => {
    const service = db.services.find((s) => s.id === serviceId);
    if (!service) return "datos" as const;
    const endMs = start.getTime() + service.durationMin * 60_000;
    if (hasConflict(db, start.getTime(), endMs)) return "ocupado" as const;
    const appt: Appointment = {
      id: randomUUID(),
      token: randomBytes(16).toString("hex"),
      serviceId,
      startISO: start.toISOString(),
      endISO: new Date(endMs).toISOString(),
      name,
      phone,
      reason: reason || undefined,
      status: "confirmed",
      source: "manual",
      createdAt: new Date().toISOString(),
      // Lo cargó Hugo mismo, así que ya lo coordinó con el paciente.
      confirmedAt: new Date().toISOString(),
    };
    db.appointments.push(appt);
    return "ok" as const;
  }).catch((e) => {
    if (isOverlapError(e)) return "ocupado" as const;
    throw e;
  });

  if (result !== "ok") redirect(`/admin/nuevo?error=${result}`);
  revalidatePath("/admin");
  redirect(`/admin?fecha=${date}`);
}

export async function saveHours(formData: FormData) {
  await guard();
  const weekly: DayHours[] = [];
  for (let d = 0; d < 7; d++) {
    const ranges: DayHours["ranges"] = [];
    for (const i of [1, 2]) {
      const start = str(formData.get(`s${i}_${d}`), 5);
      const end = str(formData.get(`e${i}_${d}`), 5);
      if (HHMM.test(start) && HHMM.test(end) && hhmmToMinutes(start) < hhmmToMinutes(end))
        ranges.push({ start, end });
    }
    weekly.push({ open: formData.get(`open_${d}`) === "on" && ranges.length > 0, ranges });
  }
  await updateDB((db) => {
    db.settings.weekly = weekly;
  });
  revalidatePath("/admin/horarios");
  redirect("/admin/horarios?ok=horarios");
}

export async function saveRules(formData: FormData) {
  await guard();
  await updateDB((db) => {
    const s = db.settings;
    s.bufferMin = num(formData.get("bufferMin"), s.bufferMin, 0, 120);
    s.minNoticeHours = num(formData.get("minNoticeHours"), s.minNoticeHours, 0, 168);
    s.maxDays = num(formData.get("maxDays"), s.maxDays, 1, 180);
    s.cancelLimitHours = num(formData.get("cancelLimitHours"), s.cancelLimitHours, 0, 168);
    s.stepMin = num(formData.get("stepMin"), s.stepMin, 5, 120);
  });
  redirect("/admin/horarios?ok=reglas");
}

export async function saveServices(formData: FormData) {
  await guard();
  const count = num(formData.get("count"), 0, 0, 50);
  await updateDB((db) => {
    for (let i = 0; i < count; i++) {
      const id = str(formData.get(`id_${i}`), 60);
      const s = db.services.find((x) => x.id === id);
      if (!s) continue;
      s.name = str(formData.get(`name_${i}`), 80) || s.name;
      s.description = str(formData.get(`description_${i}`), 300);
      s.durationMin = num(formData.get(`duration_${i}`), s.durationMin, 10, 240);
      s.priceLabel = str(formData.get(`price_${i}`), 40) || s.priceLabel;
    }
    const newName = str(formData.get("new_name"), 80);
    if (newName) {
      db.services.push({
        id: `${newName.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${randomBytes(2).toString("hex")}`,
        name: newName,
        description: str(formData.get("new_description"), 300),
        durationMin: num(formData.get("new_duration"), 30, 10, 240),
        priceLabel: str(formData.get("new_price"), 40) || "A confirmar",
      });
    }
  });
  redirect("/admin/horarios?ok=servicios");
}

export async function addBlock(formData: FormData) {
  await guard();
  const from = str(formData.get("from"), 10);
  const to = str(formData.get("to"), 10) || from;
  const reason = str(formData.get("reason"), 100) || "Bloqueado";
  if (!isDateStr(from) || !isDateStr(to) || to < from) redirect("/admin/horarios?ok=bloqueo-error");
  await updateDB((db) => {
    db.blocks.push({
      id: randomUUID(),
      startISO: artToDate(from, 0).toISOString(),
      endISO: artToDate(to, 24 * 60).toISOString(),
      reason,
    });
  });
  redirect("/admin/horarios?ok=bloqueo");
}

export async function deleteBlock(formData: FormData) {
  await guard();
  const id = str(formData.get("id"), 60);
  await updateDB((db) => {
    db.blocks = db.blocks.filter((b) => b.id !== id);
  });
  redirect("/admin/horarios?ok=bloqueo");
}
