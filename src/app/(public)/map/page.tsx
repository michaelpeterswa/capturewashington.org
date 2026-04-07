export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntryStatus } from "@prisma/client";
import type { EntryListItem } from "@/types";
import { FullMap } from "@/components/FullMap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map | Capture Washington",
  description: "Explore historic buildings across Washington state on a map",
};

export default async function MapPage() {
  const entries = await prisma.entry.findMany({
    where: { status: EntryStatus.PUBLISHED, deletedAt: null },
    include: {
      tags: true,
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  const mapped: EntryListItem[] = entries.map((entry) => ({
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
    <main className="p-6">
      {mapped.length === 0 ? (
        <EmptyState
          title="No buildings yet"
          message="Published entries will appear as pins on this map."
        />
      ) : (
        <FullMap entries={mapped} />
      )}
    </main>
  );
}
