import { notFound } from "next/navigation";
import { getWork } from "@/lib/workOrders";
import WorkDetail from "@/components/WorkDetail";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getWork(id);

  if (!work) notFound();

  return <WorkDetail work={work} />;
}
