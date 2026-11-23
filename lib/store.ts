import { readFileDB, updateFileDB } from "./store-file";
import { readSupabaseDB, updateSupabaseDB } from "./store-supabase";
import type { DB } from "./types";

export { DbError } from "./store-supabase";

/*
  Toda la app usa solo readDB() y updateDB().
  Con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY guarda en Supabase (producción).
  Sin esas variables usa un archivo local (desarrollo).
*/
const useSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export function readDB(): Promise<DB> {
  return useSupabase ? readSupabaseDB() : readFileDB();
}

export function updateDB<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  return useSupabase ? updateSupabaseDB(fn) : updateFileDB(fn);
}

// Error de la base por dos turnos superpuestos (restricción no_overlap).
export function isOverlapError(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "23P01";
}
