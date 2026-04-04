import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { getPublicUrl } from "@/lib/r2";
import { EntryStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { validateEntryFields } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const isAdminUser = !!session?.user?.role;

  const entry = await prisma.entry.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      ...(isAdminUser
        ? {}
        : { status: EntryStatus.PUBLISHED, deletedAt: null }),
    },
    include: {
      tags: true,
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bodyHtml = await renderMarkdown(entry.body);

  return NextResponse.json({
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    body: entry.body,
    bodyHtml,
    locationName: entry.locationName,
    lat: entry.lat,
    lng: entry.lng,
    capturedAt: entry.capturedAt.toISOString(),
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    media: entry.media.map((m) => ({
      id: m.id,
      url: getPublicUrl(m.r2Key),
      type: m.type,
      mimeType: m.mimeType,
      sortOrder: m.sortOrder,
    })),
    tags: entry.tags.map((t) => ({ id: t.id, name: t.name })),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const {
    title,
    body: entryBody,
    locationName,
    lat,
    lng,
    capturedAt,
    status,
    tagIds,
    deletedAt,
  } = body;

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

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (entryBody !== undefined) data.body = entryBody;
  if (locationName !== undefined) data.locationName = locationName;
  if (lat !== undefined) data.lat = lat;
  if (lng !== undefined) data.lng = lng;
  if (capturedAt !== undefined) data.capturedAt = new Date(capturedAt);
  if (status !== undefined) data.status = status as EntryStatus;
  if (deletedAt !== undefined)
    data.deletedAt = deletedAt ? new Date(deletedAt) : null;

  if (tagIds !== undefined) {
    data.tags = { set: tagIds.map((tagId: string) => ({ id: tagId })) };
  }

  const entry = await prisma.entry.update({
    where: { id },
    data,
    include: { tags: true },
  });

  return NextResponse.json({
    id: entry.id,
    slug: entry.slug,
    status: entry.status,
    deletedAt: entry.deletedAt?.toISOString() ?? null,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const entry = await prisma.entry.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({
    id: entry.id,
    deletedAt: entry.deletedAt?.toISOString(),
  });
}
