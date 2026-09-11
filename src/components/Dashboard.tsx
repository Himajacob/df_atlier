"use client";

import { useEffect, useMemo, useState } from "react";
import WorkCard from "./WorkCard";
import { WORK_STATUSES } from "@/lib/types";
import type { WorkOrder } from "@/lib/types";

type Filter = "All" | (typeof WORK_STATUSES)[number];

export default function Dashboard() {
  const [works, setWorks] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const url = query.trim()
          ? `/api/works?q=${encodeURIComponent(query.trim())}`
          : "/api/works";
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load works");
        setWorks(data.works);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const filtered = useMemo(
    () => (filter === "All" ? works : works.filter((w) => w.status === filter)),
    [works, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: works.length };
    for (const status of WORK_STATUSES) {
      c[status] = works.filter((w) => w.status === status).length;
    }
    return c;
  }, [works]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest">
            Works Overview
          </h1>
          <p className="font-sans text-sm text-ink/60">
            {works.length} commission{works.length === 1 ? "" : "s"} on record
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by fabric, occasion, customer…"
          className="w-full rounded-full border border-gold/30 bg-white/70 px-4 py-2 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:w-80"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", ...WORK_STATUSES] as Filter[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full border px-4 py-1.5 font-sans text-xs font-medium tracking-wide transition-colors ${
              filter === status
                ? "border-forest bg-forest text-cream"
                : "border-gold/30 bg-white/50 text-forest/70 hover:border-gold"
            }`}
          >
            {status} · {counts[status] ?? 0}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center font-sans text-sm text-ink/50">
          Loading works…
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-white/40 py-16 text-center">
          <p className="font-display text-xl text-forest/70">
            {query ? "No matching works found" : "No works yet"}
          </p>
          <p className="mt-1 font-sans text-sm text-ink/50">
            {query
              ? "Try a different search term."
              : "Add your first commission to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
