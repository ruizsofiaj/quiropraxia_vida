import { cookies } from "next/headers";
import { DEMO_CONTACT_WHATSAPP, IS_DEMO, TABLE_PREFIX } from "./demo";
import type { DB, DayHours } from "./types";

/*
  Perfiles del sistema de turnos.
  - "hugo": el sitio real de Hugo (quiropráctico), con sus datos, su foto, su video y su logo.
  - Rubros genéricos (consultorio, peluquería, estética, taller, estudio): el mismo sistema para cualquier negocio.
    Cada cliente nuevo usa PROFILE_KEY=<rubro> y pisa sus datos con variables de entorno (ver README).
  - En la demo (DEMO_MODE=1) el visitante elige el rubro y se guarda en una cookie.
*/

export const RUBROS = ["consultorio", "peluqueria", "estetica", "taller", "estudio"] as const;
export type Rubro = (typeof RUBROS)[number];
export const isRubro = (v: unknown): v is Rubro => RUBROS.includes(v as Rubro);

export type Profile = {
  key: string;
  isDemo: boolean;
  custom: boolean; // true solo en el sitio de Hugo: tiene foto, video y logo propios
  health: boolean; // rubros de salud: la política de privacidad habla de datos de salud
  rubroLabel: string;
  name: string;
  professional: string;
  title: string;
  tagline: string;
  whatsapp: string;
  whatsappDisplay: string;
  instagram: string;
  address: string;
  city: string;
  mapQuery: string;
  heroBadge: string;
  heroTitle: [string, string];
  intro: string;
  vocab: { client: string; clients: string; place: string; service: string };
  copy: {
    navServices: string;
    navAbout: string;
    servicesTitleSingle: string;
    servicesTitleMulti: string;
    servicesLead: string;
    stepsTitle: string;
    steps: [string, string][];
    aboutTitle: string;
    aboutP1: string;
    aboutP2: string;
    testimonialsTitle: string;
    testimonials: { name: string; text: string }[];
    locationTitle: string;
    mapTitle: string;
    ctaTitle: string;
    footerNote: string;
    photoLabel: string;
    mediaLabel: string;
  };
  msg: {
    waHello: string; // mensaje del botón de WhatsApp de la web
    waNoSlot: string; // mensaje cuando no hay horarios disponibles
    writeToUs: string; // "Escribile a Hugo" / "Escribinos"
    willWriteYou: string; // "Hugo te va a escribir" / "Te vamos a escribir"
    noteLabel: string;
    noteVisibleTo: string; // "solo lo ve Hugo"
    confirmIntro: string; // "soy el Lic. Hugo Rodríguez" / "te escribimos de X"
    signoff: string;
  };
  privacyNote: string;
  dbScope: string; // prefijo de tablas / nombre del archivo local ("" = el principal)
  seed: DB;
};

// ---------- Datos de ejemplo por rubro ----------
const weekly = (days: number[], ranges: DayHours["ranges"]): DayHours[] =>
  Array.from({ length: 7 }, (_, d) => (days.includes(d) ? { open: true, ranges } : { open: false, ranges: [] }));

const baseSettings = {
  bufferMin: 10,
  minNoticeHours: 3,
  maxDays: 30,
  cancelLimitHours: 12,
  stepMin: 30,
};

const seedOf = (
  days: number[],
  ranges: DayHours["ranges"],
  services: DB["services"],
): DB => ({
  settings: { ...baseSettings, weekly: weekly(days, ranges) },
  services,
  blocks: [],
  appointments: [],
});

type GenericSpec = {
  rubroLabel: string;
  name: string;
  professional: string;
  title: string;
  heroBadge: string;
  heroTitle: [string, string];
  intro: string;
  vocab: Profile["vocab"];
  health: boolean;
  steps: [string, string][];
  aboutP1: string;
  testimonials: { name: string; text: string }[];
  seed: DB;
};

function generic(key: Rubro, s: GenericSpec): Profile {
  const { clients, place, service } = s.vocab;
  return {
    key,
    isDemo: false,
    custom: false,
    health: s.health,
    rubroLabel: s.rubroLabel,
    name: s.name,
    professional: s.professional,
    title: s.title,
    tagline: "Reservá tu turno online en un minuto",
    whatsapp: "5490000000000",
    whatsappDisplay: "000 000-0000",
    instagram: "https://www.instagram.com/",
    address: "Av. Siempre Viva 123",
    city: "Córdoba, Capital",
    mapQuery: "Plaza San Martín, Córdoba, Argentina",
    heroBadge: s.heroBadge,
    heroTitle: s.heroTitle,
    intro: s.intro,
    vocab: s.vocab,
    copy: {
      navServices: "Servicios",
      navAbout: "Nosotros",
      servicesTitleSingle: `Tu ${service}`,
      servicesTitleMulti: "Qué ofrecemos",
      servicesLead: `Elegí el ${service} que necesitás y reservá tu turno en un minuto.`,
      stepsTitle: "Cómo reservar",
      steps: s.steps,
      aboutTitle: "Sobre nosotros",
      aboutP1: s.aboutP1,
      aboutP2: `Acá se pueden sumar los datos que dan confianza a los ${clients}: años de trabajo, formación y qué los distingue.`,
      testimonialsTitle: `Lo que dicen nuestros ${clients}`,
      testimonials: s.testimonials,
      locationTitle: "Dónde estamos",
      mapTitle: `Mapa del ${place}`,
      ctaTitle: "Reservá tu turno hoy.",
      footerNote: "",
      photoLabel: "Acá va la foto del equipo",
      mediaLabel: `Acá puede ir un video o fotos del ${place}.`,
    },
    msg: {
      waHello: "Hola, quería consultar por un turno.",
      waNoSlot: "Hola, no encontré turno disponible. ¿Me ayudan?",
      writeToUs: "Escribinos",
      willWriteYou: "Te vamos a escribir",
      noteLabel: "Comentario",
      noteVisibleTo: "solo lo ve el equipo",
      confirmIntro: `te escribimos de ${s.name}`,
      signoff: `¡Te esperamos! ${s.name}`,
    },
    privacyNote: s.health
      ? "Motivo de consulta (opcional): es un dato de salud. Lo ve solo el equipo, y no se envía por WhatsApp ni por ningún otro medio."
      : "Comentario (opcional): lo ve solo el equipo, y no se envía por WhatsApp ni por ningún otro medio.",
    dbScope: "",
    seed: s.seed,
  };
}

const T = (c: string) => [
  { name: `${c} 1`, text: "Texto de ejemplo: reservar el turno online fue facilísimo y me atendieron puntual." },
  { name: `${c} 2`, text: "Texto de ejemplo: me explicaron todo con claridad y volví a reservar." },
  { name: `${c} 3`, text: "Texto de ejemplo: muy buena atención y el lugar impecable." },
];

const GENERIC: Record<Rubro, Profile> = {
  consultorio: generic("consultorio", {
    rubroLabel: "Consultorio",
    name: "Consultorio Ejemplo",
    professional: "Ana Ejemplo",
    title: "Atención profesional de la salud · Consultorio de ejemplo",
    heroBadge: "Salud · Consultorio de ejemplo",
    heroTitle: ["Tu salud,", "con turno cuando lo necesitás."],
    intro:
      "Evaluamos tu caso, te explicamos qué te pasa y trabajamos juntos en tu tratamiento. Este texto es de ejemplo: acá va la presentación de tu consultorio.",
    vocab: { client: "paciente", clients: "pacientes", place: "consultorio", service: "consulta" },
    health: true,
    steps: [
      ["Reservás", "Elegís el día y el horario que mejor te quedan, sin llamar."],
      ["Te atendemos", "Evaluamos tu caso y te explicamos el plan a seguir."],
      ["Seguimos", "Coordinamos los próximos turnos según tu evolución."],
    ],
    aboutP1:
      "Acá se presenta el profesional: su formación, su experiencia y cómo trabaja. Este texto es de ejemplo.",
    testimonials: T("Paciente"),
    seed: seedOf([1, 2, 3, 4, 5], [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }], [
      { id: "primera-consulta", name: "Primera consulta", description: "Evaluación completa y primer tratamiento. Los precios son de ejemplo.", durationMin: 60, priceLabel: "$20.000" },
      { id: "control", name: "Control", description: "Seguimiento de tu evolución.", durationMin: 30, priceLabel: "$15.000" },
    ]),
  }),
  peluqueria: generic("peluqueria", {
    rubroLabel: "Peluquería",
    name: "Peluquería Ejemplo",
    professional: "Equipo de Peluquería Ejemplo",
    title: "Corte, color y peinados · Peluquería de ejemplo",
    heroBadge: "Peluquería · Local de ejemplo",
    heroTitle: ["Tu mejor look,", "con el turno asegurado."],
    intro:
      "Cortes, color y peinados con atención personalizada. Reservá tu horario online y llegá sin esperas. Este texto es de ejemplo: acá va la presentación de tu peluquería.",
    vocab: { client: "cliente", clients: "clientes", place: "local", service: "servicio" },
    health: false,
    steps: [
      ["Elegís", "Elegís el servicio y el día que mejor te queda."],
      ["Reservás", "Confirmás tu horario en un minuto, sin llamar."],
      ["Te esperamos", "Llegás a tu turno y te atendemos sin demoras."],
    ],
    aboutP1:
      "Acá cuenta tu historia: quiénes son, cuánto tiempo llevan y qué los distingue. Este texto es de ejemplo.",
    testimonials: T("Cliente"),
    seed: seedOf([2, 3, 4, 5, 6], [{ start: "10:00", end: "20:00" }], [
      { id: "corte", name: "Corte", description: "Corte y peinado. Los precios son de ejemplo.", durationMin: 45, priceLabel: "$12.000" },
      { id: "color", name: "Color", description: "Tintura o mechas, con lavado y peinado.", durationMin: 120, priceLabel: "$35.000" },
      { id: "peinado", name: "Peinado", description: "Peinado para eventos.", durationMin: 60, priceLabel: "$15.000" },
    ]),
  }),
  estetica: generic("estetica", {
    rubroLabel: "Estética y spa",
    name: "Estética Ejemplo",
    professional: "Equipo de Estética Ejemplo",
    title: "Tratamientos faciales y corporales · Centro de ejemplo",
    heroBadge: "Estética y bienestar · Centro de ejemplo",
    heroTitle: ["Un rato para vos,", "con turno propio."],
    intro:
      "Tratamientos faciales, corporales y masajes en un ambiente tranquilo. Reservá tu momento online. Este texto es de ejemplo: acá va la presentación de tu centro.",
    vocab: { client: "cliente", clients: "clientes", place: "centro", service: "tratamiento" },
    health: false,
    steps: [
      ["Elegís", "Elegís el tratamiento que querés hacerte."],
      ["Reservás", "Marcás día y horario desde el celular."],
      ["Te relajás", "Llegás y nos ocupamos del resto."],
    ],
    aboutP1:
      "Acá cuenta tu historia: quiénes son, qué técnicas usan y qué los distingue. Este texto es de ejemplo.",
    testimonials: T("Cliente"),
    seed: seedOf([1, 2, 3, 4, 5, 6], [{ start: "09:00", end: "19:00" }], [
      { id: "limpieza", name: "Limpieza facial", description: "Limpieza profunda e hidratación. Los precios son de ejemplo.", durationMin: 60, priceLabel: "$18.000" },
      { id: "depilacion", name: "Depilación", description: "Depilación definitiva por zona.", durationMin: 30, priceLabel: "$8.000" },
      { id: "masaje", name: "Masaje relajante", description: "Masaje corporal descontracturante.", durationMin: 60, priceLabel: "$20.000" },
    ]),
  }),
  taller: generic("taller", {
    rubroLabel: "Taller mecánico",
    name: "Taller Ejemplo",
    professional: "Equipo de Taller Ejemplo",
    title: "Mecánica ligera y service · Taller de ejemplo",
    heroBadge: "Mecánica · Taller de ejemplo",
    heroTitle: ["Tu auto al día,", "sin esperas."],
    intro:
      "Service, cambio de aceite y diagnóstico con turno fijo, para que sepas cuándo dejar y cuándo retirar el auto. Este texto es de ejemplo: acá va la presentación de tu taller.",
    vocab: { client: "cliente", clients: "clientes", place: "taller", service: "servicio" },
    health: false,
    steps: [
      ["Elegís", "Elegís el servicio que necesita tu auto."],
      ["Reservás", "Marcás el día y la hora para dejarlo."],
      ["Lo retirás", "Te avisamos cuando está listo."],
    ],
    aboutP1:
      "Acá cuenta tu historia: cuánto tiempo llevan, qué marcas atienden y qué los distingue. Este texto es de ejemplo.",
    testimonials: T("Cliente"),
    seed: seedOf([1, 2, 3, 4, 5], [{ start: "08:00", end: "17:00" }], [
      { id: "service", name: "Service completo", description: "Aceite, filtros y revisión general. Los precios son de ejemplo.", durationMin: 120, priceLabel: "$60.000" },
      { id: "aceite", name: "Cambio de aceite y filtros", description: "Aceite y filtro de aceite.", durationMin: 60, priceLabel: "$25.000" },
      { id: "diagnostico", name: "Diagnóstico", description: "Revisión y diagnóstico de fallas.", durationMin: 30, priceLabel: "$10.000" },
    ]),
  }),
  estudio: generic("estudio", {
    rubroLabel: "Clases y entrenamiento",
    name: "Estudio Ejemplo",
    professional: "Equipo de Estudio Ejemplo",
    title: "Yoga, pilates y entrenamiento · Estudio de ejemplo",
    heroBadge: "Clases · Estudio de ejemplo",
    heroTitle: ["Tu clase,", "reservada en un minuto."],
    intro:
      "Clases individuales y de prueba con cupos limitados. Reservá tu lugar online. Este texto es de ejemplo: acá va la presentación de tu estudio.",
    vocab: { client: "alumno", clients: "alumnos", place: "estudio", service: "clase" },
    health: false,
    steps: [
      ["Elegís", "Elegís el tipo de clase que querés."],
      ["Reservás", "Marcás día y horario con cupo disponible."],
      ["Entrenás", "Llegás, te cambiás y arrancamos."],
    ],
    aboutP1:
      "Acá cuenta tu historia: quiénes dan las clases, su formación y qué los distingue. Este texto es de ejemplo.",
    testimonials: T("Alumno"),
    seed: seedOf([1, 2, 3, 4, 5], [{ start: "08:00", end: "12:00" }, { start: "17:00", end: "21:00" }], [
      { id: "prueba", name: "Clase de prueba", description: "Tu primera clase, sin compromiso. Los precios son de ejemplo.", durationMin: 60, priceLabel: "Gratis" },
      { id: "individual", name: "Clase individual", description: "Clase personalizada uno a uno.", durationMin: 60, priceLabel: "$10.000" },
    ]),
  }),
};

// ---------- El sitio real de Hugo ----------
const HUGO: Profile = {
  key: "hugo",
  isDemo: false,
  custom: true,
  health: true,
  rubroLabel: "Quiropráctico",
  name: "Quiropraxia & Vida",
  professional: "Lic. Hugo Rodríguez",
  title: "Lic. en Kinesiología y Fisioterapia (UNC) · M.P. 202 · Quiropráctico",
  tagline: "Alivio tu dolor recuperando tu equilibrio",
  // Prefijo internacional de móvil argentino (54 9) + 385 4769624.
  whatsapp: "5493854769624",
  whatsappDisplay: "385 476-9624",
  instagram: "https://www.instagram.com/quiropraxia.vida/",
  address: "Catamarca 133, Instituto IMELAS",
  city: "Santiago del Estero, Capital",
  mapQuery: "Catamarca 133, Santiago del Estero, Argentina",
  heroBadge: "Quiropráctico · Especialista en columna vertebral",
  heroTitle: ["Alivio tu dolor,", "recuperando tu equilibrio."],
  intro:
    "Soy el Lic. Hugo Rodríguez, kinesiólogo y quiropráctico, con 20 años de experiencia cuidando la salud de mis pacientes. Evalúo tu caso, te explico qué te pasa y trabajamos juntos para que vuelvas a moverte sin dolor.",
  vocab: { client: "paciente", clients: "pacientes", place: "consultorio", service: "consulta" },
  copy: {
    navServices: "Consulta",
    navAbout: "Sobre Hugo",
    servicesTitleSingle: "Tu consulta",
    servicesTitleMulti: "Cómo puedo ayudarte",
    servicesLead:
      "Cada consulta empieza con una evaluación. Después elegimos juntos el tratamiento que mejor se adapta a vos.",
    stepsTitle: "Tu primera consulta, paso a paso",
    steps: [
      ["Conversamos", "Me contás qué te duele, desde cuándo y cómo afecta tu día a día."],
      ["Evaluamos", "Reviso tu postura, tu movilidad y las zonas con molestia."],
      ["Empezamos", "Te explico el plan y, si corresponde, hacemos el primer ajuste."],
    ],
    aboutTitle: "Sobre Hugo",
    aboutP1:
      "Licenciado en Kinesiología y Fisioterapia (UNC, M.P. 202) y quiropráctico, especialista en columna vertebral. Combino la mirada clínica de la kinesiología con la técnica quiropráctica para tratar el dolor de raíz.",
    aboutP2:
      "Son 20 años de experiencia. Mi objetivo es que entiendas qué le pasa a tu cuerpo y que salgas de cada sesión con un plan claro.",
    testimonialsTitle: "Lo que cuentan mis pacientes",
    // PLACEHOLDER: reemplazar por testimonios reales de pacientes (con su permiso).
    testimonials: [
      { name: "Paciente 1", text: "Texto de ejemplo: llegué con dolor de espalda hace meses y hoy puedo trabajar sin molestias." },
      { name: "Paciente 2", text: "Texto de ejemplo: me explicó cada paso y me sentí cuidado desde la primera consulta." },
      { name: "Paciente 3", text: "Texto de ejemplo: reservar el turno online fue facilísimo y me atendieron puntual." },
    ],
    locationTitle: "Dónde atiendo",
    mapTitle: "Mapa del consultorio",
    ctaTitle: "Tu cuerpo te está pidiendo atención. Reservá tu turno hoy.",
    footerNote: "Los resultados pueden variar según cada persona.",
    photoLabel: "",
    mediaLabel: "",
  },
  msg: {
    waHello: "Hola Hugo, quería consultarte por un turno.",
    waNoSlot: "Hola Hugo, no encontré turno disponible. ¿Me ayudás?",
    writeToUs: "Escribile a Hugo",
    willWriteYou: "Hugo te va a escribir",
    noteLabel: "Motivo de consulta",
    noteVisibleTo: "solo lo ve Hugo",
    confirmIntro: "soy el Lic. Hugo Rodríguez",
    signoff: "¡Te espero! Lic. Hugo Rodríguez",
  },
  privacyNote:
    "Motivo de consulta (opcional): es un dato de salud. Lo ve solo Hugo, y no se envía por WhatsApp ni por ningún otro medio.",
  dbScope: "",
  seed: {
    settings: {
      ...baseSettings,
      weekly: weekly([1, 2, 3, 4, 5], [{ start: "14:00", end: "20:00" }]),
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
  },
};

// ---------- Selección del perfil ----------
const envText = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

// Datos que cada cliente nuevo pisa con variables de entorno (plantilla configurable).
function withOverrides(p: Profile): Profile {
  const e = process.env;
  const name = envText(e.BUSINESS_NAME) ?? p.name;
  const professional = envText(e.BUSINESS_PROFESSIONAL) ?? p.professional;
  return {
    ...p,
    name,
    professional,
    whatsapp: envText(e.BUSINESS_WHATSAPP) ?? p.whatsapp,
    whatsappDisplay: envText(e.BUSINESS_WHATSAPP_DISPLAY) ?? p.whatsappDisplay,
    address: envText(e.BUSINESS_ADDRESS) ?? p.address,
    city: envText(e.BUSINESS_CITY) ?? p.city,
    mapQuery: envText(e.BUSINESS_MAP_QUERY) ?? p.mapQuery,
    instagram: envText(e.BUSINESS_INSTAGRAM) ?? p.instagram,
    tagline: envText(e.BUSINESS_TAGLINE) ?? p.tagline,
    msg: p.custom
      ? p.msg
      : {
          ...p.msg,
          confirmIntro: `te escribimos de ${name}`,
          signoff: `¡Te esperamos! ${name}`,
        },
    dbScope: TABLE_PREFIX,
  };
}

export const RUBRO_COOKIE = "qv_rubro";

export async function getProfile(): Promise<Profile> {
  if (IS_DEMO) {
    const jar = await cookies();
    const k = jar.get(RUBRO_COOKIE)?.value;
    const rubro: Rubro = isRubro(k) ? k : "consultorio";
    return { ...GENERIC[rubro], isDemo: true, dbScope: `demo_${rubro}_` };
  }
  const key = envText(process.env.PROFILE_KEY);
  const base = isRubro(key) ? GENERIC[key] : HUGO;
  return withOverrides(base);
}

export function waLink(profile: Pick<Profile, "whatsapp">, text?: string) {
  const base = `https://wa.me/${profile.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export { DEMO_CONTACT_WHATSAPP, IS_DEMO };

// Nombre corto de cada rubro, para los botones de la demo.
export const GENERIC_LABELS: Record<Rubro, string> = {
  consultorio: "Consultorio",
  peluqueria: "Peluquería",
  estetica: "Estética y spa",
  taller: "Taller",
  estudio: "Clases y entrenamiento",
};
