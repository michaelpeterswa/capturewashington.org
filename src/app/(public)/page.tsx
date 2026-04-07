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
  const nextCursor = hasMore ? (results[results.length - 1]?.id ?? null) : null;

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

  return (
    <main className="max-w-3xl xl:max-w-4xl mx-auto px-6 py-10">
      {mapped.length === 0 ? (
        <EmptyState
          title="No entries yet"
          message="Historic buildings from across Washington state will appear here."
        />
      ) : (
        <InfiniteTimeline initialEntries={mapped} initialCursor={nextCursor} />
      )}
    </main>
  );
}
