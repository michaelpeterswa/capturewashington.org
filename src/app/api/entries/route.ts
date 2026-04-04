import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { generateSlug } from "@/lib/slug";
import { validateEntryFields } from "@/lib/validation";
import { EntryStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

  const entries = await prisma.entry.findMany({
    where: {
      status: EntryStatus.PUBLISHED,
      deletedAt: null,
    },
    orderBy: [{ capturedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    include: {
      tags: true,
      media: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  const hasMore = entries.length > limit;
  const results = hasMore ? entries.slice(0, limit) : entries;
  const nextCursor = hasMore ? results[results.length - 1]?.id ?? null : null;

  return NextResponse.json({
    entries: results.map((entry) => ({
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      locationName: entry.locationName,
      lat: entry.lat,
      lng: entry.lng,
      capturedAt: entry.capturedAt.toISOString(),
      thumbnailUrl: entry.media[0]
        ? getPublicUrl(entry.media[0].r2Key)
        : null,
      tags: entry.tags.map((t) => ({ id: t.id, name: t.name })),
    })),
    nextCursor,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { title, body: entryBody, locationName, lat, lng, capturedAt, tagIds } =
    body;

  const validation = validateEntryFields({
    title,
    body: entryBody,
    locationName,
    lat,
    lng,
  });
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const slug = generateSlug(title);

  const entry = await prisma.entry.create({
    data: {
      title,
      slug,
      body: entryBody,
      locationName,
      lat,
      lng,
      capturedAt: new Date(capturedAt),
      status: EntryStatus.DRAFT,
      createdById: session.user.id,
      ...(tagIds?.length
        ? { tags: { connect: tagIds.map((id: string) => ({ id })) } }
        : {}),
    },
  });

  return NextResponse.json(
    { id: entry.id, slug: entry.slug, status: entry.status },
    { status: 201 },
  );
}
