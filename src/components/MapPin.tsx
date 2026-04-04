"use client";

import type { EntryListItem } from "@/types";
import Link from "next/link";

export function MapPopup({ entry }: { entry: EntryListItem }) {
  return (
    <div style={{ maxWidth: "200px" }}>
      {entry.thumbnailUrl && (
        <img
          src={entry.thumbnailUrl}
          alt={entry.title}
          style={{
            width: "100%",
            height: "100px",
            objectFit: "cover",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-2)",
          }}
        />
      )}
      <h3
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-semibold)",
          marginBottom: "var(--space-1)",
        }}
      >
        {entry.title}
      </h3>
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-2)",
        }}
      >
        {entry.locationName}
      </p>
      <Link
        href={`/entry/${entry.slug}`}
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-primary)",
        }}
      >
        View entry &rarr;
      </Link>
    </div>
  );
}
