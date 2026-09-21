import type { WorkStatus } from "@/lib/types";

export default function StatusBadge({
  status,
  price,
  paidCash = 0,
  paidUpi = 0,
}: {
  status: WorkStatus;
  price?: number;
  paidCash?: number;
  paidUpi?: number;
}) {
  const paidTotal = (paidCash || 0) + (paidUpi || 0);
  const isCompletedButUnpaid =
    status === "Completed" && typeof price === "number" && paidTotal < price;

  const className = isCompletedButUnpaid
    ? "bg-amber-300/80 text-forest-dark"
    : status === "Received"
    ? "bg-gold-light/60 text-forest-dark"
    : "bg-forest text-cream";

  const label = isCompletedButUnpaid ? "Incomplete payment" : status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-sans text-xs font-medium tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}
