export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { MediaGallery } from "@/components/MediaGallery";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { EntryMap } from "@/components/EntryMap";
import { EntryStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await prisma.entry.findFirst({
    where: { slug, status: EntryStatus.PUBLISHED, deletedAt: null },
  });
  return {
    title: entry ? `${entry.title} | Capture Washington` : "Not Found",
    description: entry
      ? `Historic building: ${entry.title} in ${entry.locationName}`
      : undefined,
  };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await prisma.entry.findFirst({
    where: { slug, status: EntryStatus.PUBLISHED, deletedAt: null },
    include: {
      tags: true,
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!entry) notFound();

  const media = entry.media.map((m) => ({
    id: m.id,
    url: getPublicUrl(m.r2Key),
    type: m.type,
    mimeType: m.mimeType,
    sortOrder: m.sortOrder,
  }));

  const formattedDate = new Date(entry.capturedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-prose mx-auto px-6 pt-8 pb-16 animate-[fadeIn_0.4s_ease]">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 text-muted-foreground text-sm uppercase tracking-wide hover:text-foreground transition-colors"
      >
        <span>&larr;</span>
        Back to timeline
      </Link>

      {/* Title */}
      <h1 className="font-display text-4xl font-normal leading-tight tracking-tight mb-4">
        {entry.title}
      </h1>

      {/* Metadata */}
      <div className="flex gap-3 items-center text-muted-foreground text-sm flex-wrap mb-5">
        <span>{entry.locationName}</span>
        <span className="text-border">&middot;</span>
        <time dateTime={entry.capturedAt.toISOString()}>{formattedDate}</time>
      </div>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {entry.tags.map((tag) => (
            <Link key={tag.id} href={`/search?tags=${tag.id}`}>
              <Badge
                variant="secondary"
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <Separator className="mb-8" />

      {/* Media */}
      <MediaGallery media={media} />

      {/* Body */}
      <MarkdownRenderer content={entry.body} />

      {/* Map */}
      <div className="mt-10 pt-8 border-t border-border">
        <h2 className="font-display text-xl font-normal mb-4 text-muted-foreground">
          Location
        </h2>
        <EntryMap lat={entry.lat} lng={entry.lng} title={entry.title} />
      </div>
    </main>
  );
}
