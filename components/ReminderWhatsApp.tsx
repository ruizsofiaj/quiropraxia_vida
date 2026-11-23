"use client";

import { useTransition } from "react";
import { markReminded } from "@/app/admin/actions";
import { WhatsAppIcon } from "./icons";

// Abre WhatsApp con el recordatorio escrito y, en paralelo, deja marcado que ya se mandó.
export function ReminderWhatsApp({
  token,
  href,
  name,
  sent,
  urgent = false,
  label,
}: {
  token: string;
  href: string;
  name: string;
  sent: boolean;
  urgent?: boolean; // botón rojo cuando el recordatorio está pendiente
  label?: string;
}) {
  const [, start] = useTransition();
  const text = label ?? (sent ? "Reenviar recordatorio" : "Recordatorio");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${sent ? "Reenviar el recordatorio" : "Enviar el recordatorio"} por WhatsApp a ${name}`}
      onClick={() => {
        if (!sent) start(() => markReminded(token));
      }}
      className={`btn !min-h-10 !px-4 text-sm ${
        urgent && !sent ? "bg-danger text-white hover:bg-[#7f2620]" : "btn-ghost"
      }`}
    >
      <WhatsAppIcon className="h-5 w-5" /> {text}
    </a>
  );
}
