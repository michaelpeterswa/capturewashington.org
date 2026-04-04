import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { presignUpload } from "@/lib/r2";
import { validateUpload } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { filename, contentType, fileSize, entryId } = body;

  if (!filename || !contentType || !fileSize || !entryId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const currentCount = await prisma.media.count({
    where: { entryId },
  });

  const validation = validateUpload(fileSize, contentType, currentCount);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const ext = filename.split(".").pop() || "bin";
  const r2Key = `media/${entryId}/${createId()}.${ext}`;

  const uploadUrl = await presignUpload(r2Key, contentType);

  return NextResponse.json({ uploadUrl, r2Key });
}
