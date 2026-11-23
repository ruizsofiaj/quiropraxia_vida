"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { fetchSlots, submitBooking, type BookingState } from "@/app/actions";
import { fmtDateLong, fmtTime } from "@/lib/time";
import { DatePicker } from "./DatePicker";
import { CheckIcon, ClockIcon } from "./icons";

type ServiceLite = { id: string; name: string; description: string; durationMin: number; priceLabel: string };

type Props = {
  services: ServiceLite[];
  openDows: number[];
  today: string;
  maxDays: number;
  contactName: string; // nombre del profesional y link de WhatsApp: vienen del servidor (la demo usa otros)
  contactHref: string;
  reschedule?: {
    token: string;
    serviceId: string;
    name: string;
    phone: string;
    reason: string;
  };
};

const initial: BookingState = {};

export function BookingFlow({ services, openDows, today, maxDays, contactName, contactHref, reschedule }: Props) {
  // Con un solo servicio se elige solo y se oculta el primer paso.
  const single = services.length === 1;
  const n = single ? 0 : 1;
  const [serviceId, setServiceId] = useState(
    reschedule?.serviceId ?? (single ? services[0].id : ""),
  );
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slot, setSlot] = useState("");
  const [state, formAction, pending] = useActionState(submitBooking, initial);

  useEffect(() => {
    if (!serviceId || !date) return;
    let cancelled = false;
    fetchSlots(serviceId, date, reschedule?.token).then((res) => {
      if (!cancelled) setSlots(res);
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId, date, reschedule?.token]);

  const service = services.find((s) => s.id === serviceId);

  function pickService(id: string) {
    setServiceId(id);
    setSlot("");
    setSlots(null);
  }
  function pickDate(d: string) {
    setDate(d);
    setSlot("");
    setSlots(null);
  }

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="startISO" value={slot} />
      {reschedule && <input type="hidden" name="rescheduleToken" value={reschedule.token} />}
      {/* Campo trampa anti-bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No completar
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* 1. Servicio */}
      <fieldset hidden={single}>
        <legend className="font-serif text-2xl font-semibold">
          <span className="mr-2 text-clay">1.</span>¿Qué consulta necesitás?
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {services.map((s) => {
            const active = s.id === serviceId;
            return (
              <label
                key={s.id}
                className={`card relative cursor-pointer !p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-clay ${
                  active ? "!border-sea bg-sea-soft" : "hover:border-sea/50"
                }`}
              >
                <input
                  type="radio"
                  name="service-choice"
                  className="sr-only"
                  checked={active}
                  onChange={() => pickService(s.id)}
                />
                <span className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{s.name}</span>
                  {active && <CheckIcon className="h-5 w-5 shrink-0 text-sea" />}
                </span>
                <span className="mt-1 block text-sm text-ink-soft">{s.description}</span>
                <span className="mt-3 flex items-center gap-1.5 text-sm font-medium">
                  <ClockIcon className="h-4 w-4 text-sea" /> {s.durationMin} min
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 2. Día */}
      <fieldset disabled={!serviceId} className="disabled:opacity-50">
        <legend className="font-serif text-2xl font-semibold">
          <span className="mr-2 text-clay">{n + 1}.</span>Elegí el día
        </legend>
        <div className="mt-4">
          <DatePicker today={today} maxDays={maxDays} openDows={openDows} value={date} onChange={pickDate} />
        </div>
      </fieldset>

      {/* 3. Horario */}
      <fieldset disabled={!serviceId || !date} className="disabled:opacity-50">
        <legend className="font-serif text-2xl font-semibold">
          <span className="mr-2 text-clay">{n + 2}.</span>Elegí el horario
        </legend>
        <div className="mt-4" aria-live="polite">
          {!date ? (
            <p className="text-ink-soft">Primero elegí un día.</p>
          ) : slots === null ? (
            <p className="text-ink-soft">Buscando horarios libres…</p>
          ) : slots.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-ink-soft">
              No quedan horarios ese día. Probá con otro día o{" "}
              <a className="font-semibold text-sea underline" href={contactHref}>
                escribile a {contactName}
              </a>
              .
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6" role="radiogroup" aria-label="Horarios libres">
              {slots.map((iso) => {
                const active = iso === slot;
                return (
                  <button
                    key={iso}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSlot(iso)}
                    className={`min-h-12 rounded-xl border-[1.5px] font-semibold transition-colors ${
                      active
                        ? "border-sea bg-sea text-white"
                        : "border-line bg-white hover:border-sea/60"
                    }`}
                  >
                    {fmtTime(iso)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </fieldset>

      {/* 4. Datos */}
      <fieldset disabled={!slot} className="disabled:opacity-50">
        <legend className="font-serif text-2xl font-semibold">
          <span className="mr-2 text-clay">{n + 3}.</span>Tus datos
        </legend>

        {service && slot && (
          <p className="mt-3 rounded-2xl bg-sea-soft p-4 text-sm">
            <strong>{service.name}</strong> · {fmtDateLong(slot)}, {fmtTime(slot)} hs
          </p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Nombre y apellido</label>
            <input id="name" name="name" required autoComplete="name" className="field" defaultValue={reschedule?.name} />
          </div>
          <div>
            <label className="label" htmlFor="phone">WhatsApp (con código de área)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder="Ej: 385 4123456"
              className="field"
              defaultValue={reschedule?.phone}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="reason">
              Motivo de consulta <span className="font-normal text-ink-soft">(opcional; solo lo ve {contactName})</span>
            </label>
            <textarea id="reason" name="reason" rows={3} maxLength={500} className="field" defaultValue={reschedule?.reason} />
          </div>
        </div>

        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-[var(--sea)]" />
          <span>
            Acepto la{" "}
            <Link href="/privacidad" target="_blank" className="font-semibold text-sea underline">
              política de privacidad
            </Link>{" "}
            y el uso de mis datos para gestionar el turno.
          </span>
        </label>

        {state.error && (
          <p role="alert" className="mt-4 rounded-xl border border-danger/30 bg-red-50 p-3 text-sm text-danger">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending || !slot} className="btn btn-primary mt-6 w-full sm:w-auto">
          {pending ? "Reservando…" : reschedule ? "Confirmar nuevo horario" : "Confirmar turno"}
        </button>
      </fieldset>
    </form>
  );
}
