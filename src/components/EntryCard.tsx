import Link from "next/link";
import type { EntryListItem } from "@/types";

export function EntryCard({ entry }: { entry: EntryListItem }) {
  const formattedDate = new Date(entry.capturedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/entry/${entry.slug}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        backgroundColor: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
        transition: "box-shadow var(--transition-base)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          aspectRatio: "16/9",
          backgroundColor: "var(--color-bg-alt)",
          overflow: "hidden",
        }}
      >
        {entry.thumbnailUrl ? (
          <img
            src={entry.thumbnailUrl}
            alt={entry.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
              fontSize: "var(--text-sm)",
            }}
            aria-label="No image available"
          >
            No image
          </div>
        )}
      </div>
      <div style={{ padding: "var(--space-4)" }}>
        <h2
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--font-semibold)",
            lineHeight: "var(--leading-tight)",
            marginBottom: "var(--space-1)",
          }}
        >
          {entry.title}
        </h2>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-1)",
          }}
        >
          {entry.locationName}
        </p>
        <time
          dateTime={entry.capturedAt}
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          {formattedDate}
        </time>
        {entry.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "var(--space-1)",
              flexWrap: "wrap",
              marginTop: "var(--space-2)",
            }}
          >
            {entry.tags.map((tag) => (
              <span
                key={tag.id}
                style={{
                  fontSize: "var(--text-xs)",
                  padding: "2px var(--space-2)",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
