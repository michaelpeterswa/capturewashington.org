import { prisma } from "./db";
import { getPublicUrl } from "./r2";
import { EntryStatus, Prisma } from "@prisma/client";
import type { EntryListItem } from "@/types";

export interface SearchParams {
  q?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  lat?: number;
  lng?: number;
  radius?: number; // miles
  cursor?: string;
  limit?: number;
}

export async function searchEntries(params: SearchParams) {
  const limit = Math.min(params.limit || 20, 50);
  const where: Prisma.EntryWhereInput = {
    status: EntryStatus.PUBLISHED,
    deletedAt: null,
  };

  if (params.tags?.length) {
    where.tags = { some: { id: { in: params.tags } } };
  }

  if (params.dateFrom || params.dateTo) {
    where.capturedAt = {};
    if (params.dateFrom) where.capturedAt.gte = new Date(params.dateFrom);
    if (params.dateTo) where.capturedAt.lte = new Date(params.dateTo);
  }

  // For keyword search and geo search, we use raw SQL since Prisma
  // doesn't support tsvector or earthdistance natively. For now, use
  // Prisma's contains filter as a simple implementation. Full-text
  // search with tsvector can be added via raw queries when the
  // Postgres extensions are configured.
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { body: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const entries = await prisma.entry.findMany({
    where,
    orderBy: [{ capturedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    include: {
      tags: true,
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  let results = entries;

  // Client-side geo filtering (until earthdistance extension is set up)
  if (
    params.lat !== undefined &&
    params.lng !== undefined &&
    params.radius !== undefined
  ) {
    const radiusKm = params.radius * 1.60934;
    results = results.filter((entry) => {
      const dist = haversineDistance(
        params.lat!,
        params.lng!,
        entry.lat,
        entry.lng,
      );
      return dist <= radiusKm;
    });
  }

  const hasMore = results.length > limit;
  const page = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null;

  const mapped: EntryListItem[] = page.map((entry) => ({
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

  return { entries: mapped, nextCursor, totalCount: mapped.length };
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
