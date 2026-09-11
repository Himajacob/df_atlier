import type { WorkStatus } from "@/lib/types";

const STYLES: Record<WorkStatus, string> = {
  Received: "bg-gold-light/60 text-forest-dark",
  Completed: "bg-forest text-cream",
};

export default function StatusBadge({ status }: { status: WorkStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-sans text-xs font-medium tracking-wide ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
