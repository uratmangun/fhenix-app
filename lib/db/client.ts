import fs from "node:fs";
import path from "node:path";

type SqlValue = string | number | bigint | boolean | Uint8Array | null;
type Row = Record<string, unknown>;

type DatabaseBackend = {
  all: <T extends Row = Row>(sql: string, args?: SqlValue[]) => Promise<T[]>;
  get: <T extends Row = Row>(sql: string, args?: SqlValue[]) => Promise<T | undefined>;
  run: (sql: string, args?: SqlValue[]) => Promise<void>;
};

function normalizeArgs(args: SqlValue[] = []) {
  return args.map((arg) => (typeof arg === "boolean" ? Number(arg) : arg));
}

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "products.db");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

let backendPromise: Promise<DatabaseBackend> | null = null;

async function createBackend(): Promise<DatabaseBackend> {
  ensureDataDir();

  if (process.platform === "android") {
    const sqlite = await import("node:sqlite");
    const database = new sqlite.DatabaseSync(dbPath);

    return {
      all: async <T extends Row = Row>(sql: string, args: SqlValue[] = []) => database.prepare(sql).all(...normalizeArgs(args)) as T[],
      get: async <T extends Row = Row>(sql: string, args: SqlValue[] = []) => database.prepare(sql).get(...normalizeArgs(args)) as T | undefined,
      run: async (sql: string, args: SqlValue[] = []) => {
        database.prepare(sql).run(...normalizeArgs(args));
      },
    };
  }

  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${dbPath}` });

  return {
    all: async <T extends Row = Row>(sql: string, args: SqlValue[] = []) => {
      const result = await client.execute({ sql, args: normalizeArgs(args) });
      return result.rows as unknown as T[];
    },
    get: async <T extends Row = Row>(sql: string, args: SqlValue[] = []) => {
      const result = await client.execute({ sql, args: normalizeArgs(args) });
      return result.rows[0] as unknown as T | undefined;
    },
    run: async (sql: string, args: SqlValue[] = []) => {
      await client.execute({ sql, args });
    },
  };
}

async function getBackend() {
  if (!backendPromise) {
    backendPromise = createBackend();
  }

  return backendPromise;
}

export async function queryAll<T extends Row = Row>(sql: string, args: SqlValue[] = []) {
  const backend = await getBackend();
  return backend.all<T>(sql, args);
}

export async function queryOne<T extends Row = Row>(sql: string, args: SqlValue[] = []) {
  const backend = await getBackend();
  return backend.get<T>(sql, args);
}

export async function execute(sql: string, args: SqlValue[] = []) {
  const backend = await getBackend();
  await backend.run(sql, args);
}

export async function initializeDb() {
  await execute(`
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      owner TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS product_votes (
      product_id INTEGER NOT NULL,
      voter TEXT NOT NULL,
      voted INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (product_id, voter)
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS product_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  const productColumns = await queryAll<{ name?: string }>("PRAGMA table_info(products)");
  const productColumnNames = productColumns.map((row) => row.name ?? "");

  if (!productColumnNames.includes("owner")) {
    await execute("ALTER TABLE products ADD COLUMN owner TEXT NOT NULL DEFAULT ''");
  }

  if (!productColumnNames.includes("description")) {
    await execute("ALTER TABLE products ADD COLUMN description TEXT NOT NULL DEFAULT ''");
  }
}
