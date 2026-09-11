"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const inputClasses =
  "w-full rounded-lg border border-gold/30 bg-white/70 px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelClasses =
  "mb-1 block font-sans text-xs font-medium uppercase tracking-wider text-forest/70";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Could not sign in.");
      }

      router.push(searchParams.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Image
          src="/images/df_logo.png"
          alt="daffodilz"
          width={72}
          height={51}
          priority
        />
        <span className="font-[var(--font-alex-brush)] text-3xl text-gold-dark">
          Atelier
        </span>
        <p className="font-sans text-sm text-ink/60">
          Sign in to manage boutique work orders.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-gold/25 bg-white/60 p-6 shadow-sm"
      >
        <div>
          <label className={labelClasses}>Username</label>
          <input
            required
            autoFocus
            className={inputClasses}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. admin"
          />
        </div>
        <div>
          <label className={labelClasses}>Password</label>
          <input
            required
            type="password"
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-forest px-6 py-2 font-sans text-sm text-cream transition-colors hover:bg-forest-light disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <Link
        href="/forgot-password"
        className="mt-4 self-center font-sans text-sm text-forest/70 transition-colors hover:text-gold-dark"
      >
        Forgot password?
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
