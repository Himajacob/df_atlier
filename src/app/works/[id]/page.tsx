import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getWork } from "@/lib/workOrders";
import WorkDetail from "@/components/WorkDetail";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [work, session] = await Promise.all([getWork(id), getSession()]);

  if (!work) notFound();

  return <WorkDetail work={work} canDelete={session?.role === "admin"} />;
}
