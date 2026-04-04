"use client";

import type { MediaItem } from "@/types";
import { MediaType } from "@/types";

export function MediaGallery({ media }: { media: MediaItem[] }) {
  if (media.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "var(--space-3)",
        marginBottom: "var(--space-6)",
      }}
    >
      {media.map((item) => (
        <div
          key={item.id}
          style={{
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            backgroundColor: "var(--color-bg-alt)",
            aspectRatio: item.type === MediaType.VIDEO ? "16/9" : undefined,
          }}
        >
          {item.type === MediaType.PHOTO ? (
            <img
              src={item.url}
              alt=""
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
              loading="lazy"
            />
          ) : (
            <video
              src={item.url}
              controls
              preload="metadata"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <track kind="captions" />
            </video>
          )}
        </div>
      ))}
    </div>
  );
}
