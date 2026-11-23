"use client";

import { useTransition } from "react";
import { markConfirmed } from "@/app/admin/actions";
import { WhatsAppIcon } from "./icons";

// Abre WhatsApp con el mensaje armado y, en paralelo, deja marcado el turno como confirmado.
export function ConfirmWhatsApp({
  token,
  href,
  name,
  confirmed,
}: {
  token: string;
  href: string;
  name: string;
  confirmed: boolean;
}) {
  const [, start] = useTransition();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${confirmed ? "Reenviar la confirmación" : "Confirmar el turno"} por WhatsApp a ${name}`}
      onClick={() => {
        if (!confirmed) start(() => markConfirmed(token));
      }}
      className={`btn !min-h-10 !px-4 text-sm ${confirmed ? "btn-ghost" : "btn-primary"}`}
    >
      <WhatsAppIcon className="h-5 w-5" /> {confirmed ? "Reenviar" : "Confirmar"}
    </a>
  );
}
