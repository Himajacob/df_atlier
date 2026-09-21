"use client";

import type { WorkOrderInput } from "@/lib/types";
import { WORK_STATUSES, validateWorkOrderInput } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const EMPTY: WorkOrderInput = {
  customerName: "",
  customerPhone: "",
  quantity: 1,
  status: WORK_STATUSES[0],
  description: "",
  price: 0,
  paidCash: 0,
  paidUpi: 0,
  dueDate: "",
  notes: "",
};

const inputClasses =
  "w-full rounded-lg border border-gold/30 bg-white/70 px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelClasses =
  "mb-1 block font-sans text-xs font-medium uppercase tracking-wider text-forest/70";

export default function WorkForm({
  initial,
  workId,
}: {
  initial?: WorkOrderInput;
  workId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<WorkOrderInput>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(workId);
  const paidTotal = form.paidCash + form.paidUpi;
  const overPaid = paidTotal > form.price;
  // completedButUnpaid: user selected Completed but payments don't match price
  const completedButUnpaid = form.status === "Completed" && paidTotal < form.price;
  const controllerRef = useRef<AbortController | null>(null);

  function update<K extends keyof WorkOrderInput>(
    key: K,
    value: WorkOrderInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCancel() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    router.back();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateWorkOrderInput(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 45_000);

    try {
      const res = await fetch(isEdit ? `/api/works/${workId}` : "/api/works", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });

      let data: { work?: { id: string }; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error(
          `The server sent back an unreadable response (status ${res.status}).`
        );
      }

      if (!res.ok || !data.work) {
        throw new Error(data.error ?? `Something went wrong (status ${res.status}).`);
      }

      // After saving (create or update), navigate back to the dashboard.
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (controllerRef.current === controller) {
          setError(
            "This is taking too long. The database may be unreachable — check your connection and try again."
          );
          setSaving(false);
        }
        // else: the user clicked Cancel, which already aborted this
        // request and navigated away — nothing left to show here.
      } else if (err instanceof TypeError) {
        setError(
          "Could not reach the app server. Check that it's still running and try again."
        );
        setSaving(false);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setSaving(false);
      }
    } finally {
      clearTimeout(timeout);
    }

    // Ensure saving state is cleared if we didn't navigate away for any reason.
    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-gold/25 bg-white/60 p-6 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClasses}>Customer Name</label>
          <input
            required
            className={inputClasses}
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
            placeholder="e.g. Meera Krishnan"
          />
        </div>
        <div>
          <label className={labelClasses}>Phone</label>
          <input
            className={inputClasses}
            value={form.customerPhone}
            onChange={(e) => update("customerPhone", e.target.value)}
            placeholder="e.g. +91 98765 43210"
          />
        </div>
        <div>
          <label className={labelClasses}>Quantity</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => update("quantity", Math.max(1, form.quantity - 1))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-white/70 font-sans text-lg text-forest transition-colors hover:border-gold hover:bg-gold-light/30"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              className={`${inputClasses} text-center`}
              value={form.quantity}
              onChange={(e) =>
                update("quantity", Math.max(1, Number(e.target.value) || 1))
              }
            />
            <button
              type="button"
              onClick={() => update("quantity", form.quantity + 1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-white/70 font-sans text-lg text-forest transition-colors hover:border-gold hover:bg-gold-light/30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className={labelClasses}>Status</label>
          <select
            className={inputClasses}
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value as WorkOrderInput["status"])
            }
          >
            {WORK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClasses}>Total Price (₹)</label>
          <input
            type="number"
            min={0}
            className={inputClasses}
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClasses}>Cash Paid (₹)</label>
          <input
            type="number"
            min={0}
            className={`${inputClasses} ${
              overPaid ? "border-red-400 focus:border-red-400 focus:ring-red-200" : completedButUnpaid ? "border-amber-300 focus:border-amber-300 focus:ring-amber-200" : ""
            }`}
            value={form.paidCash}
            onChange={(e) => update("paidCash", Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClasses}>UPI Paid (₹)</label>
          <input
            type="number"
            min={0}
            className={`${inputClasses} ${
              overPaid ? "border-red-400 focus:border-red-400 focus:ring-red-200" : completedButUnpaid ? "border-amber-300 focus:border-amber-300 focus:ring-amber-200" : ""
            }`}
            value={form.paidUpi}
            onChange={(e) => update("paidUpi", Number(e.target.value))}
          />
          {overPaid && (
            <p className="mt-1 font-sans text-xs text-red-600">
              Cash + UPI ({paidTotal}) cannot be greater than the total price.
            </p>
          )}
          {!overPaid && completedButUnpaid && (
            <p className="mt-1 font-sans text-xs text-amber-700">
              Warning: payment incomplete (₹{form.price - paidTotal} due). The work will be tagged "Incomplete payment" and shown in yellow.
            </p>
          )}
        </div>
        <div>
          <label className={labelClasses}>Due Date</label>
          <input
            type="date"
            className={inputClasses}
            value={form.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClasses}>Description</label>
        <textarea
          rows={3}
          className={inputClasses}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Fabric, design, measurements reference, occasion..."
        />
      </div>

      <div>
        <label className={labelClasses}>Notes</label>
        <textarea
          rows={2}
          className={inputClasses}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Anything else worth remembering"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full border border-forest/30 px-5 py-2 font-sans text-sm text-forest transition-colors hover:bg-forest/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || overPaid}
          className="rounded-full bg-forest px-6 py-2 font-sans text-sm text-cream transition-colors hover:bg-forest-light disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Work"}
        </button>
      </div>
    </form>
  );
}
