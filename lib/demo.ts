// Modo demo: la misma app con un consultorio ficticio y una base de datos aparte.
// Se activa con DEMO_MODE=1 en el proyecto de Vercel de la demo. En el sitio real no está definida.
export const IS_DEMO = process.env.DEMO_MODE === "1";

// Los datos de la demo viven en tablas con este prefijo (demo_services, demo_appointments, ...).
export const TABLE_PREFIX = process.env.DB_TABLE_PREFIX ?? "";

// WhatsApp de quien ofrece el sistema, para el botón "Quiero este sistema" de la demo (opcional).
export const DEMO_CONTACT_WHATSAPP = process.env.DEMO_CONTACT_WHATSAPP ?? "";
