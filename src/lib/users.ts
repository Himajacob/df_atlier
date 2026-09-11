import { query } from "./db";
import { hashPassword, verifyPassword } from "./password";
import type { User, UserRole } from "./types";

export { describeDbError } from "./db";

interface UserRow {
  id: string;
  username: string;
  role: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

function toSafeUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    role: row.role as UserRole,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function fromRow(row: UserRow): User & { passwordHash: string } {
  return { ...toSafeUser(row), passwordHash: row.password_hash };
}

function toId(username: string): string {
  return username.trim().toLowerCase();
}

export async function listUsers(): Promise<User[]> {
  const result = await query<UserRow>(
    "SELECT * FROM users ORDER BY username ASC"
  );
  return result.rows.map(toSafeUser);
}

export async function countAdmins(): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*) FROM users WHERE role = 'admin'"
  );
  return Number(result.rows[0].count);
}

export async function getUserByUsername(
  username: string
): Promise<(User & { passwordHash: string }) | null> {
  const result = await query<UserRow>("SELECT * FROM users WHERE id = $1", [
    toId(username),
  ]);
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query<UserRow>("SELECT * FROM users WHERE id = $1", [
    id,
  ]);
  return result.rows[0] ? toSafeUser(result.rows[0]) : null;
}

export async function createUser(input: {
  username: string;
  password: string;
  role: UserRole;
}): Promise<User | { error: string }> {
  const username = input.username.trim();
  if (!username) return { error: "Username is required." };
  if (!input.password || input.password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const id = toId(username);
  const existing = await getUserByUsername(id);
  if (existing) return { error: "That username is already taken." };

  const result = await query<UserRow>(
    `INSERT INTO users (id, username, role, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, username, input.role, hashPassword(input.password)]
  );

  return toSafeUser(result.rows[0]);
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<User | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function setUserPassword(
  id: string,
  newPassword: string
): Promise<User | { error: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const result = await query<UserRow>(
    `UPDATE users SET password_hash = $2, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, hashPassword(newPassword)]
  );
  if (!result.rows[0]) return { error: "User not found." };
  return toSafeUser(result.rows[0]);
}

export async function deleteUser(id: string): Promise<void> {
  await query("DELETE FROM users WHERE id = $1", [id]);
}
