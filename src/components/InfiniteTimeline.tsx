"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EntryCard } from "./EntryCard";
import type { EntryListItem, PaginatedResponse } from "@/types";

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

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
      {cursor && (
        <div ref={sentinelRef} style={{ padding: "var(--space-8)" }}>
          {loading && (
            <p
              style={{
                textAlign: "center",
                color: "var(--color-text-muted)",
              }}
            >
              Loading more...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
