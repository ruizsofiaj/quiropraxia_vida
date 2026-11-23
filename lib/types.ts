export type Service = {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  priceLabel: string;
};

export type DayHours = {
  open: boolean;
  ranges: { start: string; end: string }[]; // "HH:MM"
};

export type Settings = {
  weekly: DayHours[]; // índice 0 = domingo
  bufferMin: number;
  minNoticeHours: number;
  maxDays: number;
  cancelLimitHours: number;
  stepMin: number;
};

export type Block = {
  id: string;
  startISO: string;
  endISO: string;
  reason: string;
};

export type Appointment = {
  id: string;
  token: string;
  serviceId: string;
  startISO: string;
  endISO: string;
  name: string;
  phone: string;
  reason?: string;
  status: "confirmed" | "cancelled";
  source: "web" | "manual";
  createdAt: string;
  // Cuándo Hugo confirmó el turno por WhatsApp. Se borra si el turno se mueve.
  confirmedAt?: string;
};

export type DB = {
  settings: Settings;
  services: Service[];
  blocks: Block[];
  appointments: Appointment[];
};
