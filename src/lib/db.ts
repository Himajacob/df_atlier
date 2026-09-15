import { Pool, type QueryResultRow } from "pg";

declare global {
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.POSTGRES_DB;
  if (!connectionString) {
    throw new Error(
      "POSTGRES_DB is not set. Add your Neon connection string to .env.local."
    );
  }
  return new Pool({ connectionString });
}

// Reuse the pool across hot reloads in dev (each reload would otherwise
// create a new pool and leak connections against the same process).
const pool = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          role TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS work_orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL DEFAULT '',
          quantity INTEGER NOT NULL DEFAULT 1,
          status TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          price NUMERIC NOT NULL DEFAULT 0,
          paid_cash NUMERIC NOT NULL DEFAULT 0,
          paid_upi NUMERIC NOT NULL DEFAULT 0,
          due_date TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS paid_cash NUMERIC NOT NULL DEFAULT 0;
        ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS paid_upi NUMERIC NOT NULL DEFAULT 0;

        DO $migrate_total_paid$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'work_orders' AND column_name = 'total_paid'
          ) THEN
            -- Preserve pre-migration payments as cash (the split wasn't
            -- tracked yet, so cash is the closest single-bucket guess).
            UPDATE work_orders SET paid_cash = total_paid WHERE total_paid <> 0;
            ALTER TABLE work_orders DROP COLUMN total_paid;
          END IF;
        END
        $migrate_total_paid$;
        `
      )
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  await ensureSchema();
  return pool.query<T>(text, params);
}

export function describeDbError(err: unknown): {
  status: number;
  message: string;
} {
  const code = (err as { code?: string } | null)?.code;

  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "57P01" // Postgres: admin shutdown / connection terminated
  ) {
    return {
      status: 502,
      message:
        "Can't reach the database. Check that POSTGRES_DB in .env.local is correct and the Neon project is active.",
    };
  }
  if (code === "23505") {
    return { status: 409, message: "That record already exists." };
  }

  const message = err instanceof Error ? err.message : String(err);
  return { status: 500, message: `Unexpected error: ${message}` };
}
