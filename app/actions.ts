"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { computeSlots } from "@/lib/availability";
import { isOverlapError, readDB, updateDB } from "@/lib/store";
import { artParts } from "@/lib/time";
import type { Appointment } from "@/lib/types";

export type BookingState = { error?: string };

export async function fetchSlots(
  serviceId: string,
  dateStr: string,
  ignoreToken?: string,
): Promise<string[]> {
  const db = await readDB();
  return computeSlots(db, serviceId, dateStr, new Date(), ignoreToken || undefined);
}

function clean(v: FormDataEntryValue | null, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function submitBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  // Campo trampa para bots: un humano no lo ve ni lo completa.
  if (clean(formData.get("website"), 50)) return { error: "No pudimos procesar la reserva." };

  const serviceId = clean(formData.get("serviceId"), 60);
  const startISO = clean(formData.get("startISO"), 40);
  const name = clean(formData.get("name"), 80);
  const phoneRaw = clean(formData.get("phone"), 30);
  const reason = clean(formData.get("reason"), 500);
  const rescheduleToken = clean(formData.get("rescheduleToken"), 80);
  const consent = formData.get("consent") === "on";

  const phone = phoneRaw.replace(/[^\d+]/g, "");
  const digits = phone.replace(/\D/g, "");

  if (name.length < 2) return { error: "Escribí tu nombre completo." };
  if (digits.length < 8 || digits.length > 15)
    return { error: "Revisá tu número de WhatsApp. Incluí el código de área." };
  if (!consent) return { error: "Tenés que aceptar la política de privacidad para reservar." };
  if (!serviceId || !startISO || Number.isNaN(Date.parse(startISO)))
    return { error: "Elegí un servicio, un día y un horario." };

  const now = new Date();
  const start = new Date(startISO);
  const dateStr = artParts(start).date;

  type Outcome =
    | { ok: false; error: string }
    | { ok: true; appt: Appointment; kind: "nuevo" | "reprogramado" };

  let outcome: Outcome;
  try {
    outcome = await bookSlot();
  } catch (e) {
    // La base rechazó el turno porque otro se reservó justo antes.
    if (isOverlapError(e)) return { error: "Ese horario se ocupó recién. Elegí otro, por favor." };
    throw e;
  }

  function bookSlot(): Promise<Outcome> {
    return updateDB((db): Outcome => {
    const service = db.services.find((s) => s.id === serviceId);
    if (!service) return { ok: false, error: "El servicio ya no está disponible." } as const;

    let existing: Appointment | undefined;
    if (rescheduleToken) {
      existing = db.appointments.find((a) => a.token === rescheduleToken);
      if (!existing || existing.status !== "confirmed")
        return { ok: false, error: "No encontramos ese turno para reprogramar." } as const;
      const hoursLeft = (new Date(existing.startISO).getTime() - now.getTime()) / 3_600_000;
      if (hoursLeft < db.settings.cancelLimitHours)
        return {
          ok: false,
          error: `Solo se puede mover un turno hasta ${db.settings.cancelLimitHours} horas antes. Escribile a Hugo por WhatsApp.`,
        } as const;
    }

    const free = computeSlots(db, serviceId, dateStr, now, existing?.token);
    if (!free.includes(start.toISOString()))
      return {
        ok: false,
        error: "Ese horario se ocupó recién. Elegí otro, por favor.",
      } as const;

    const endISO = new Date(start.getTime() + service.durationMin * 60_000).toISOString();

    if (existing) {
      existing.serviceId = serviceId;
      existing.startISO = start.toISOString();
      existing.endISO = endISO;
      existing.confirmedAt = undefined; // el horario cambió: Hugo tiene que volver a confirmar
      existing.name = name;
      existing.phone = phone;
      existing.reason = reason || undefined;
      return { ok: true, appt: existing, kind: "reprogramado" } as const;
    }

    const appt: Appointment = {
      id: randomUUID(),
      token: randomBytes(16).toString("hex"),
      serviceId,
      startISO: start.toISOString(),
      endISO,
      name,
      phone,
      reason: reason || undefined,
      status: "confirmed",
      source: "web",
      createdAt: now.toISOString(),
    };
    db.appointments.push(appt);
    return { ok: true, appt, kind: "nuevo" } as const;
    });
  }

  if (!outcome.ok) return { error: outcome.error };

  redirect(`/turno/${outcome.appt.token}?nuevo=1`);
}

export async function cancelBooking(formData: FormData) {
  const token = clean(formData.get("token"), 80);
  const now = new Date();

  const result = await updateDB((db) => {
    const appt = db.appointments.find((a) => a.token === token);
    if (!appt || appt.status !== "confirmed") return { error: "not-found" } as const;
    const hoursLeft = (new Date(appt.startISO).getTime() - now.getTime()) / 3_600_000;
    if (hoursLeft < db.settings.cancelLimitHours) return { error: "late" } as const;
    appt.status = "cancelled";
    return { appt } as const;
  });

  if ("error" in result) redirect(`/turno/${token}?error=${result.error}`);

  redirect(`/turno/${token}`);
}
