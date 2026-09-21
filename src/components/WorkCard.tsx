import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { WorkOrder } from "@/lib/types";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function WorkCard({ work }: { work: WorkOrder }) {
  const balance = work.price - work.paidCash - work.paidUpi;

  return (
    <Link
      href={`/works/${work.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-gold/25 bg-white/60 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-forest group-hover:text-forest-dark">
            {work.customerName}
          </h3>
          <p className="font-sans text-xs uppercase tracking-wider text-gold-dark">
            Qty {work.quantity}
          </p>
        </div>
        <StatusBadge
          status={work.status}
          price={work.price}
          paidCash={work.paidCash}
          paidUpi={work.paidUpi}
        />
      </div>

      {work.description && (
        <p className="line-clamp-2 font-sans text-sm text-ink/70">
          {work.description}
        </p>
      )}

      <div className="mt-auto flex items-end justify-between border-t border-gold/15 pt-3 font-sans text-sm">
        <div>
          <p className="text-ink/50">Due</p>
          <p className="font-medium text-ink">{formatDate(work.dueDate)}</p>
        </div>
        <div className="text-right">
          <p className="text-ink/50">Balance</p>
          <p
            className={`font-medium ${
              balance > 0 ? "text-forest-dark" : "text-forest"
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </Link>
  );
}
