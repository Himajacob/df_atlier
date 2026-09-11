import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <h1 className="mb-2 font-display text-2xl font-semibold text-forest">
        Forgot your password?
      </h1>
      <p className="mb-6 font-sans text-sm text-ink/60">
        This is an internal tool, so there&apos;s no automated email reset —
        passwords are reset directly by whoever has access below.
      </p>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-gold/25 bg-white/60 p-5 shadow-sm">
          <h2 className="mb-1 font-sans text-sm font-semibold uppercase tracking-wider text-forest">
            Receptionist
          </h2>
          <p className="font-sans text-sm text-ink/70">
            Ask your admin to reset it for you. From the{" "}
            <strong>Users</strong> page, they can set a new password for your
            account without needing your old one.
          </p>
        </div>

        <div className="rounded-2xl border border-gold/25 bg-white/60 p-5 shadow-sm">
          <h2 className="mb-1 font-sans text-sm font-semibold uppercase tracking-wider text-forest">
            Admin
          </h2>
          <p className="mb-2 font-sans text-sm text-ink/70">
            If you&apos;re locked out yourself, reset it directly from the
            server with the bootstrap script (this overwrites the existing
            password):
          </p>
          <code className="block overflow-x-auto rounded-lg bg-forest px-3 py-2 font-mono text-xs text-cream">
            npm run create-user -- your-username new-password admin
          </code>
        </div>
      </div>

      <Link
        href="/login"
        className="mt-6 self-center font-sans text-sm text-forest/70 transition-colors hover:text-gold-dark"
      >
        ← Back to sign in
      </Link>
    </div>
  );
}
