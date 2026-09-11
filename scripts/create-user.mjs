#!/usr/bin/env node
// Standalone bootstrap script: creates (or resets) a user directly in
// Postgres, bypassing the web app entirely. Needed to create the very first
// admin account (the admin UI to add users requires being logged in as an
// admin already), and useful later to reset a password if everyone is
// locked out.
//
// Usage:
//   node scripts/create-user.mjs <username> <password> <admin|receptionist>
//   npm run create-user -- <username> <password> <admin|receptionist>
//
// Reads POSTGRES_DB from .env.local (same connection string the app uses).

import { randomBytes, scryptSync } from "crypto";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// Minimal .env.local loader so this script sees POSTGRES_DB without adding a
// dependency — mirrors what Next.js does automatically for the app itself.
function loadEnvLocal() {
  const envPath = join(projectRoot, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const [, key, value = ""] = match;
    if (!(key in process.env)) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
}

// Must match src/lib/password.ts exactly, so a user created here can log
// into the app (and vice versa).
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  loadEnvLocal();

  const [, , username, password, role = "receptionist"] = process.argv;

  if (!username || !password) {
    console.error(
      "Usage: node scripts/create-user.mjs <username> <password> <admin|receptionist>"
    );
    process.exit(1);
  }
  if (role !== "admin" && role !== "receptionist") {
    console.error('Role must be "admin" or "receptionist".');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }
  if (!process.env.POSTGRES_DB) {
    console.error("POSTGRES_DB is not set. Add it to .env.local first.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: process.env.POSTGRES_DB });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const id = username.trim().toLowerCase();
  const result = await pool.query(
    `INSERT INTO users (id, username, role, password_hash)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET
       role = EXCLUDED.role,
       password_hash = EXCLUDED.password_hash,
       updated_at = now()
     RETURNING (xmax = 0) AS inserted`,
    [id, username.trim(), role, hashPassword(password)]
  );

  const created = result.rows[0].inserted;
  console.log(
    `${created ? "Created" : "Updated"} user "${username.trim()}" (${role}).`
  );

  await pool.end();
}

main().catch((err) => {
  console.error("Failed:", err.message ?? err);
  process.exit(1);
});
