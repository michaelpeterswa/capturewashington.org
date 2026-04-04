export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { InfiniteTimeline } from "@/components/InfiniteTimeline";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntryStatus } from "@prisma/client";
import type { EntryListItem } from "@/types";

const PAGE_SIZE = 20;

export default async function HomePage() {
  const entries = await prisma.entry.findMany({
    where: {
      status: EntryStatus.PUBLISHED,
      deletedAt: null,
    },
    orderBy: [{ capturedAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    include: {
      tags: true,
      media: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  const hasMore = entries.length > PAGE_SIZE;
  const results = hasMore ? entries.slice(0, PAGE_SIZE) : entries;
  const nextCursor = hasMore
    ? results[results.length - 1]?.id ?? null
    : null;

  const mapped: EntryListItem[] = results.map((entry) => ({
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    locationName: entry.locationName,
    lat: entry.lat,
    lng: entry.lng,
    capturedAt: entry.capturedAt.toISOString(),
    thumbnailUrl: entry.media[0] ? getPublicUrl(entry.media[0].r2Key) : null,
    tags: entry.tags.map((t) => ({ id: t.id, name: t.name })),
  }));

  if (mapped.length === 0) {
    return (
      <main
        style={{
          maxWidth: "var(--max-width-content)",
          margin: "0 auto",
          padding: "var(--space-6)",
        }}
      >
        <h1
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: "var(--font-bold)",
            marginBottom: "var(--space-8)",
          }}
        >
          Capture Washington
        </h1>
        <EmptyState
          title="No entries yet"
          message="Historic buildings from across Washington state will appear here."
        />
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "var(--max-width-content)",
        margin: "0 auto",
        padding: "var(--space-6)",
      }}
    >
      <h1
        style={{
          fontSize: "var(--text-3xl)",
          fontWeight: "var(--font-bold)",
          marginBottom: "var(--space-8)",
        }}
      >
        Capture Washington
      </h1>
      <InfiniteTimeline initialEntries={mapped} initialCursor={nextCursor} />
    </main>
  );
}
