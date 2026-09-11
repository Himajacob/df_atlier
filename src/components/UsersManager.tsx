"use client";

import { useState } from "react";
import { USER_ROLES } from "@/lib/types";
import type { User, UserRole } from "@/lib/types";

const inputClasses =
  "w-full rounded-lg border border-gold/30 bg-white/70 px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelClasses =
  "mb-1 block font-sans text-xs font-medium uppercase tracking-wider text-forest/70";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AddUserForm({ onCreated }: { onCreated: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("receptionist");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not add user.");

      onCreated(data.user);
      setUsername("");
      setPassword("");
      setRole("receptionist");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-gold/25 bg-white/60 p-6 shadow-sm"
    >
      <h2 className="font-display text-xl font-semibold text-forest">
        Add User
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClasses}>Username</label>
          <input
            required
            className={inputClasses}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. reception1"
          />
        </div>
        <div>
          <label className={labelClasses}>Password</label>
          <input
            required
            type="text"
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="min. 6 characters"
          />
        </div>
        <div>
          <label className={labelClasses}>Role</label>
          <select
            className={inputClasses}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "admin" ? "Admin" : "Receptionist"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="self-end rounded-full bg-forest px-6 py-2 font-sans text-sm text-cream transition-colors hover:bg-forest-light disabled:opacity-60"
      >
        {saving ? "Adding…" : "Add User"}
      </button>
    </form>
  );
}

function UserRow({
  user,
  onDeleted,
}: {
  user: User;
  onDeleted: (id: string) => void;
}) {
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not reset password.");

      setMessage({ type: "success", text: "Password updated." });
      setNewPassword("");
      setResetting(false);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Could not reset password.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${user.username}?`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not remove user.");
      onDeleted(user.id);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Could not remove user.",
      });
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-gold/15 py-4 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-sm font-medium text-ink">
            {user.username}
          </p>
          <p className="font-sans text-xs text-ink/50">
            {user.role === "admin" ? "Admin" : "Receptionist"} · added{" "}
            {formatDate(user.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setResetting((v) => !v)}
            disabled={busy}
            className="rounded-full border border-forest/30 px-4 py-1.5 font-sans text-xs text-forest transition-colors hover:bg-forest/5 disabled:opacity-60"
          >
            Reset Password
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="rounded-full border border-red-300 px-4 py-1.5 font-sans text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>

      {resetting && (
        <form
          onSubmit={handleResetPassword}
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <input
            required
            type="text"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`${inputClasses} max-w-xs`}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-forest px-4 py-1.5 font-sans text-xs text-cream transition-colors hover:bg-forest-light disabled:opacity-60"
          >
            Save
          </button>
        </form>
      )}

      {message && (
        <p
          className={`mt-2 font-sans text-xs ${
            message.type === "error" ? "text-red-600" : "text-forest"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

export default function UsersManager({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const [users, setUsers] = useState(initialUsers);

  return (
    <div className="flex flex-col gap-6">
      <AddUserForm onCreated={(user) => setUsers((prev) => [...prev, user])} />

      <div className="rounded-2xl border border-gold/25 bg-white/60 p-6 shadow-sm">
        <h2 className="mb-2 font-display text-xl font-semibold text-forest">
          All Users
        </h2>
        {users.length === 0 ? (
          <p className="font-sans text-sm text-ink/50">No users yet.</p>
        ) : (
          users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onDeleted={(id) =>
                setUsers((prev) => prev.filter((u) => u.id !== id))
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
