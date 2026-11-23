import { IS_DEMO } from "./demo";
import type { DB } from "./types";

// Datos ficticios de la demo: dos tipos de consulta y atención de lunes a sábado.
const DEMO_SEED: DB = {
  settings: {
    weekly: [
      { open: false, ranges: [] },
      { open: true, ranges: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "09:00", end: "13:00" }] },
    ],
    bufferMin: 10,
    minNoticeHours: 3,
    maxDays: 30,
    cancelLimitHours: 12,
    stepMin: 30,
  },
  services: [
    {
      id: "primera-consulta",
      name: "Primera consulta",
      description: "Evaluación completa y primer tratamiento. Los precios son de ejemplo.",
      durationMin: 60,
      priceLabel: "$20.000",
    },
    {
      id: "control",
      name: "Control",
      description: "Seguimiento de tu evolución y ajuste.",
      durationMin: 30,
      priceLabel: "$15.000",
    },
  ],
  blocks: [],
  appointments: [],
};

// Datos de assets/datos.txt: consulta $25.000, 14:00 a 20:00.
// Confirmado con Hugo: atiende de lunes a viernes y la consulta dura 45 min.
const REAL_SEED: DB = {
  settings: {
    weekly: [
      { open: false, ranges: [] },
      { open: true, ranges: [{ start: "14:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "14:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "14:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "14:00", end: "20:00" }] },
      { open: true, ranges: [{ start: "14:00", end: "20:00" }] },
      { open: false, ranges: [] },
    ],
    bufferMin: 10,
    minNoticeHours: 3,
    maxDays: 30,
    cancelLimitHours: 12,
    stepMin: 30,
  },
  services: [
    {
      id: "consulta",
      name: "Consulta",
      description: "Evaluación de tu caso y tratamiento quiropráctico según lo que necesites.",
      durationMin: 45, // Confirmado con Hugo. Se cambia desde el panel.
      priceLabel: "$25.000",
    },
  ],
  blocks: [],
  appointments: [],
};

export const SEED: DB = IS_DEMO ? DEMO_SEED : REAL_SEED;
