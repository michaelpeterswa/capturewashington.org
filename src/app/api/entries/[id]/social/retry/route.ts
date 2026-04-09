import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { SocialPostStatus } from "@prisma/client";
import { triggerCrossPost } from "@/lib/social/cross-post";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { platform } = await request.json();

  if (!platform || !["BLUESKY", "INSTAGRAM"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const socialPost = await prisma.socialPost.findUnique({
    where: { entryId_platform: { entryId: id, platform } },
  });

  if (!socialPost) {
    return NextResponse.json(
      { error: "No social post record found" },
      { status: 404 },
    );
  }

  if (socialPost.status === SocialPostStatus.SUCCESS) {
    return NextResponse.json(
      { error: "Post already succeeded" },
      { status: 409 },
    );
  }

  // Reset to PENDING and re-trigger
  await prisma.socialPost.update({
    where: { entryId_platform: { entryId: id, platform } },
    data: { status: SocialPostStatus.PENDING, errorMessage: null },
  });

  triggerCrossPost(id);

  return NextResponse.json({
    id: socialPost.id,
    platform,
    status: "PENDING",
  });
}
