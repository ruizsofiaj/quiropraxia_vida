import { getProfile } from "./profile";
import { readFileDB, updateFileDB } from "./store-file";
import { readSupabaseDB, updateSupabaseDB } from "./store-supabase";
import type { DB } from "./types";

export { DbError } from "./store-supabase";

/*
  Toda la app usa solo readDB() y updateDB().
  Con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY guarda en Supabase (producción).
  Sin esas variables usa un archivo local (desarrollo).
  Cada perfil (el sitio de Hugo, o cada rubro de la demo) tiene sus propias tablas o su propio archivo.
*/
const useSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function readDB(): Promise<DB> {
  const p = await getProfile();
  return useSupabase ? readSupabaseDB(p.dbScope, p.seed) : readFileDB(p.dbScope, p.seed);
}

export async function updateDB<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const p = await getProfile();
  return useSupabase ? updateSupabaseDB(p.dbScope, p.seed, fn) : updateFileDB(p.dbScope, p.seed, fn);
}

// Error de la base por dos turnos superpuestos (restricción no_overlap).
export function isOverlapError(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "23P01";
}
