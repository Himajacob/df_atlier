import BackButton from "@/components/BackButton";
import UsersManager from "@/components/UsersManager";
import { listUsers } from "@/lib/users";

export default async function AdminUsersPage() {
  const users = await listUsers();

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton />
      <h1 className="mb-1 font-display text-3xl font-semibold text-forest">
        Users
      </h1>
      <p className="mb-6 font-sans text-sm text-ink/60">
        Add staff accounts and manage access. Only admins can see this page.
      </p>
      <UsersManager initialUsers={users} />
    </div>
  );
}
