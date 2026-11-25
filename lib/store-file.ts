import { promises as fs } from "node:fs";
import path from "node:path";
import type { DB } from "./types";

// Almacenamiento local para desarrollo: un archivo JSON por perfil. Se usa cuando no hay claves de Supabase.
let queue: Promise<unknown> = Promise.resolve();

function fileFor(scope: string) {
  return path.join(process.cwd(), "data", scope ? `db-${scope}.json` : "db.json");
}

async function load(scope: string, seed: DB): Promise<DB> {
  const file = fileFor(scope);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as DB;
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(seed, null, 2));
    return structuredClone(seed);
  }
}

export async function readFileDB(scope: string, seed: DB): Promise<DB> {
  await queue;
  return load(scope, seed);
}

// Serializa las escrituras: dos reservas simultáneas no pisan el mismo horario.
export function updateFileDB<T>(scope: string, seed: DB, fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load(scope, seed);
    const result = await fn(db);
    const file = fileFor(scope);
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, file);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
