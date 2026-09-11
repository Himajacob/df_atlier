import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

// Format: "<salt-hex>:<hash-hex>". Kept intentionally simple (Node's built-in
// scrypt, no extra dependency) so scripts/create-user.mjs can reimplement the
// exact same scheme outside of Next.js to bootstrap the first admin user.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;

  const hash = scryptSync(password, salt, KEY_LENGTH);
  const storedHash = Buffer.from(hashHex, "hex");

  return (
    hash.length === storedHash.length && timingSafeEqual(hash, storedHash)
  );
}
