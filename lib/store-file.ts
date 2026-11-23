import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED } from "./seed";
import type { DB } from "./types";

// Almacenamiento local para desarrollo: un archivo JSON. Se usa cuando no hay claves de Supabase.
const FILE = path.join(process.cwd(), "data", "db.json");

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<DB> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as DB;
  } catch {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(SEED, null, 2));
    return structuredClone(SEED);
  }
}

export async function readFileDB(): Promise<DB> {
  await queue;
  return load();
}

// Serializa las escrituras: dos reservas simultáneas no pisan el mismo horario.
export function updateFileDB<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    const tmp = `${FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, FILE);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
