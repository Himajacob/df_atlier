"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "./BackButton";
import StatusBadge from "./StatusBadge";
import WorkForm from "./WorkForm";
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

export default function WorkDetail({ work }: { work: WorkOrder }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete the work order for ${work.customerName}?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/works/${work.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setDeleting(false);
      alert("Could not delete this work order.");
    }
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-2xl">
        <BackButton href={`/works/${work.id}`} label="Back" />
        <h1 className="mb-6 font-display text-3xl font-semibold text-forest">
          Edit Work Order
        </h1>
        <WorkForm
          workId={work.id}
          initial={{
            customerName: work.customerName,
            customerPhone: work.customerPhone,
            quantity: work.quantity,
            status: work.status,
            description: work.description,
            price: work.price,
            totalPaid: work.totalPaid,
            dueDate: work.dueDate,
            notes: work.notes,
          }}
        />
      </div>
    );
  }

  const balance = work.price - work.totalPaid;

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest">
            {work.customerName}
          </h1>
          <p className="font-sans text-sm uppercase tracking-wider text-gold-dark">
            Qty {work.quantity}
          </p>
        </div>
        <StatusBadge status={work.status} />
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-gold/25 bg-white/60 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-forest/60">
              Phone
            </p>
            <p className="font-sans text-ink">{work.customerPhone || "—"}</p>
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-forest/60">
              Due Date
            </p>
            <p className="font-sans text-ink">{formatDate(work.dueDate)}</p>
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-forest/60">
              Total Price
            </p>
            <p className="font-sans text-ink">{formatCurrency(work.price)}</p>
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-forest/60">
              Total Paid
            </p>
            <p className="font-sans text-ink">
              {formatCurrency(work.totalPaid)}
            </p>
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-forest/60">
              Balance Due
            </p>
            <p
              className={`font-sans font-medium ${
                balance > 0 ? "text-forest-dark" : "text-forest"
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {work.description && (
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-forest/60">
              Description
            </p>
            <p className="mt-1 font-sans text-sm text-ink/80">
              {work.description}
            </p>
          </div>
        )}

        {work.notes && (
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-forest/60">
              Notes
            </p>
            <p className="mt-1 font-sans text-sm text-ink/80">{work.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gold/15 pt-4 font-sans text-xs text-ink/40">
          <span>Created {formatDate(work.createdAt)}</span>
          <span>Updated {formatDate(work.updatedAt)}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full border border-red-300 px-5 py-2 font-sans text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="rounded-full bg-forest px-6 py-2 font-sans text-sm text-cream transition-colors hover:bg-forest-light"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
