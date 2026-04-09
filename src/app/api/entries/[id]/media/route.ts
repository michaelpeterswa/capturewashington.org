import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { extractExifFromUrl } from "@/lib/image";
import { MediaType } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const media = await prisma.media.findMany({
    where: { entryId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(
    media.map((m) => ({
      id: m.id,
      url: getPublicUrl(m.r2Key),
      type: m.type,
      mimeType: m.mimeType,
      sortOrder: m.sortOrder,
    })),
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { r2Key, type, mimeType, fileSize } = body;

  // Extract EXIF server-side from the uploaded image in R2
  let exifData: Record<string, unknown> = {};
  if (mimeType?.startsWith("image/")) {
    const exif = await extractExifFromUrl(getPublicUrl(r2Key));
    if (exif) {
      exifData = {
        cameraMake: exif.cameraMake,
        cameraModel: exif.cameraModel,
        lensModel: exif.lensModel,
        focalLength: exif.focalLength,
        aperture: exif.aperture,
        shutterSpeed: exif.shutterSpeed,
        iso: exif.iso,
        whiteBalance: exif.whiteBalance,
        software: exif.software,
      };
    }
  }

  const maxSort = await prisma.media.aggregate({
    where: { entryId: id },
    _max: { sortOrder: true },
  });

  const media = await prisma.media.create({
    data: {
      entryId: id,
      r2Key,
      type: type as MediaType,
      mimeType,
      fileSize,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      ...exifData,
    },
  });

  return NextResponse.json(
    {
      id: media.id,
      url: getPublicUrl(media.r2Key),
      type: media.type,
      mimeType: media.mimeType,
      sortOrder: media.sortOrder,
    },
    { status: 201 },
  );
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
  const { order } = body as { order: string[] };

  await Promise.all(
    order.map((mediaId, index) =>
      prisma.media.update({
        where: { id: mediaId, entryId: id },
        data: { sortOrder: index },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const mediaId = searchParams.get("mediaId");

  if (!mediaId) {
    return NextResponse.json({ error: "mediaId required" }, { status: 400 });
  }

  await prisma.media.delete({
    where: { id: mediaId, entryId: id },
  });

  return NextResponse.json({ success: true });
}
