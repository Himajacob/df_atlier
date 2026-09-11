import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import BackButton from "@/components/BackButton";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-md">
      <BackButton />
      <h1 className="mb-1 font-display text-3xl font-semibold text-forest">
        My Account
      </h1>
      <p className="mb-6 font-sans text-sm text-ink/60">
        Signed in as <strong>{session.username}</strong> (
        {session.role === "admin" ? "Admin" : "Receptionist"})
      </p>
      <ResetPasswordForm />
    </div>
  );
}
