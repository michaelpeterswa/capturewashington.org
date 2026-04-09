import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { extractExifFromUrl } from "@/lib/image";

export async function POST() {
  const session = await auth();
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Find all photo media missing EXIF data
  const mediaItems = await prisma.media.findMany({
    where: {
      type: "PHOTO",
      cameraMake: null,
      cameraModel: null,
      software: null,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const item of mediaItems) {
    const url = getPublicUrl(item.r2Key);
    const exif = await extractExifFromUrl(url);

    if (exif) {
      await prisma.media.update({
        where: { id: item.id },
        data: {
          cameraMake: exif.cameraMake,
          cameraModel: exif.cameraModel,
          lensModel: exif.lensModel,
          focalLength: exif.focalLength,
          aperture: exif.aperture,
          shutterSpeed: exif.shutterSpeed,
          iso: exif.iso,
          whiteBalance: exif.whiteBalance,
          software: exif.software,
        },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({
    total: mediaItems.length,
    updated,
    skipped,
  });
}
