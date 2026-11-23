import type { DB } from "./types";

// Datos de assets/datos.txt: consulta $25.000, 14:00 a 20:00.
// Confirmado con Hugo: atiende de lunes a viernes y la consulta dura 45 min.
export const SEED: DB = {
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
