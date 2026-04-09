"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EntryCard } from "./EntryCard";
import type { EntryListItem, PaginatedResponse } from "@/types";

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function TimelineDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 w-full py-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function InfiniteTimeline({
  initialEntries,
  initialCursor,
}: {
  initialEntries: EntryListItem[];
  initialCursor: string | null;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initialCount = useRef(initialEntries.length);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?cursor=${cursor}&limit=20`);
      if (!res.ok) return;
      const data: PaginatedResponse<EntryListItem> = await res.json();
      setEntries((prev) => [...prev, ...data.entries]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  let lastMonthYear = "";

  return (
    <div>
      <div className="flex flex-col items-center gap-8">
        {entries.map((entry, i) => {
          const monthYear = formatMonthYear(entry.capturedAt);
          const showDivider = monthYear !== lastMonthYear;
          lastMonthYear = monthYear;

          return (
            <div
              key={entry.id}
              className="w-full"
              style={
                i < initialCount.current
                  ? {
                      animation:
                        "cardIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
                      animationDelay: `${Math.min(i * 55, 650)}ms`,
                    }
                  : { animation: "fadeIn 0.3s ease both" }
              }
            >
              {showDivider && <TimelineDivider label={monthYear} />}
              <EntryCard entry={entry} />
            </div>
          );
        })}
      </div>
      {cursor && (
        <div ref={sentinelRef} className="py-10 text-center">
          {loading && (
            <div className="inline-flex items-center gap-3 text-muted-foreground text-sm">
              <div className="h-4 w-4 border-2 border-border border-t-primary rounded-full animate-spin" />
              Loading more&hellip;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
