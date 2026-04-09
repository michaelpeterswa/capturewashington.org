import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { fetchAndProcessImage } from "@/lib/image";
import {
  generateCaption,
  buildBlueskyFacets,
  generateHashtags,
} from "./caption";
import { postToBluesky } from "./bluesky";
import { postToInstagram } from "./instagram";
import { SocialPlatform, SocialPostStatus } from "@prisma/client";

export function shouldCrossPost(params: {
  status: string;
  previousStatus: string;
  hasMedia: boolean;
}): boolean {
  return (
    params.status === "PUBLISHED" &&
    params.previousStatus !== "PUBLISHED" &&
    params.hasMedia
  );
}

export interface CrossPostOptions {
  bluesky?: boolean;
  instagram?: boolean;
}

/**
 * Trigger cross-posting for an entry. Fire-and-forget — does not throw.
 */
export function triggerCrossPost(
  entryId: string,
  options: CrossPostOptions = {},
): void {
  executeCrossPost(entryId, options).catch((err) => {
    console.error(`[cross-post] Fatal error for entry ${entryId}:`, err);
  });
}

async function executeCrossPost(
  entryId: string,
  options: CrossPostOptions,
): Promise<void> {
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: {
      tags: true,
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (!entry || entry.media.length === 0) return;

  const siteUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || "";
  const entryUrl = `${siteUrl}/entry/${entry.slug}`;
  const tagNames = entry.tags.map((t) => t.name);

  const caption = generateCaption(
    entry.title,
    entry.locationName,
    tagNames,
    entryUrl,
  );

  const hashtags = generateHashtags(tagNames);
  const facets = buildBlueskyFacets(caption, hashtags, entryUrl);

  const imageUrl = getPublicUrl(entry.media[0].r2Key);

  // Post to Bluesky
  if (
    options.bluesky !== false &&
    process.env.BLUESKY_HANDLE &&
    process.env.BLUESKY_APP_PASSWORD
  ) {
    await postToPlatform(entryId, SocialPlatform.BLUESKY, async () => {
      const processed = await fetchAndProcessImage(imageUrl);
      const result = await postToBluesky({
        text: caption,
        imageBuffer: processed.buffer,
        imageMimeType: processed.mimeType,
        imageWidth: processed.width,
        imageHeight: processed.height,
        imageAlt: `${entry.title} — ${entry.locationName}`,
        facets,
      });
      // Convert at:// URI to web URL
      const parts = result.uri.replace("at://", "").split("/");
      const rkey = parts[2];
      const handle = process.env.BLUESKY_HANDLE!;
      return {
        externalUrl: `https://bsky.app/profile/${handle}/post/${rkey}`,
        externalId: result.uri,
      };
    });
  }

  // Post to Instagram
  if (
    options.instagram !== false &&
    process.env.INSTAGRAM_USER_ID &&
    process.env.INSTAGRAM_ACCESS_TOKEN
  ) {
    await postToPlatform(entryId, SocialPlatform.INSTAGRAM, async () => {
      // Instagram accepts CDN URL directly but needs JPEG
      // Build a caption without the link (Instagram doesn't support clickable links)
      const igCaption = generateCaption(
        entry.title,
        entry.locationName,
        tagNames,
        "", // no link for Instagram
      ).replace(/\n\n$/, ""); // trim trailing newlines from empty link

      const result = await postToInstagram({
        imageUrl: imageUrl,
        caption: igCaption,
      });
      return {
        externalUrl: `https://www.instagram.com/p/${result.mediaId}/`,
        externalId: result.mediaId,
      };
    });
  }
}

async function postToPlatform(
  entryId: string,
  platform: SocialPlatform,
  postFn: () => Promise<{ externalUrl: string; externalId: string }>,
): Promise<void> {
  // Check for existing successful post (duplicate guard)
  const existing = await prisma.socialPost.findUnique({
    where: { entryId_platform: { entryId, platform } },
  });
  if (existing?.status === SocialPostStatus.SUCCESS) return;

  // Upsert a PENDING record
  await prisma.socialPost.upsert({
    where: { entryId_platform: { entryId, platform } },
    create: { entryId, platform, status: SocialPostStatus.PENDING },
    update: { status: SocialPostStatus.PENDING, errorMessage: null },
  });

  try {
    const result = await postFn();
    await prisma.socialPost.update({
      where: { entryId_platform: { entryId, platform } },
      data: {
        status: SocialPostStatus.SUCCESS,
        externalUrl: result.externalUrl,
        externalId: result.externalId,
        postedAt: new Date(),
        errorMessage: null,
      },
    });
    console.log(`[cross-post] ${platform} success for entry ${entryId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.socialPost.update({
      where: { entryId_platform: { entryId, platform } },
      data: {
        status: SocialPostStatus.FAILED,
        errorMessage: message,
      },
    });
    console.error(
      `[cross-post] ${platform} failed for entry ${entryId}:`,
      message,
    );
  }
}
