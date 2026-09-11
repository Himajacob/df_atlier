"use client";

import { useState } from "react";

const inputClasses =
  "w-full rounded-lg border border-gold/30 bg-white/70 px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelClasses =
  "mb-1 block font-sans text-xs font-medium uppercase tracking-wider text-forest/70";

export default function ResetPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not reset password.");

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset password."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-gold/25 bg-white/60 p-6 shadow-sm"
    >
      <div>
        <label className={labelClasses}>Current Password</label>
        <input
          required
          type="password"
          className={inputClasses}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClasses}>New Password</label>
        <input
          required
          type="password"
          className={inputClasses}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClasses}>Confirm New Password</label>
        <input
          required
          type="password"
          className={inputClasses}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-forest/10 px-3 py-2 font-sans text-sm text-forest">
          Password updated.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="self-end rounded-full bg-forest px-6 py-2 font-sans text-sm text-cream transition-colors hover:bg-forest-light disabled:opacity-60"
      >
        {saving ? "Saving…" : "Reset Password"}
      </button>
    </form>
  );
}
