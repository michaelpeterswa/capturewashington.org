export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { MediaGallery } from "@/components/MediaGallery";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { EntryMap } from "@/components/EntryMap";
import { EntryStatus } from "@prisma/client";
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
    <main
      style={{
        maxWidth: "var(--max-width-prose)",
        margin: "0 auto",
        padding: "var(--space-6)",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginBottom: "var(--space-4)",
          color: "var(--color-primary)",
          textDecoration: "none",
          fontSize: "var(--text-sm)",
        }}
      >
        &larr; Back to timeline
      </Link>

      <h1
        style={{
          fontSize: "var(--text-3xl)",
          fontWeight: "var(--font-bold)",
          lineHeight: "var(--leading-tight)",
          marginBottom: "var(--space-2)",
        }}
      >
        {entry.title}
      </h1>

      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          alignItems: "center",
          marginBottom: "var(--space-6)",
          color: "var(--color-text-secondary)",
          fontSize: "var(--text-sm)",
          flexWrap: "wrap",
        }}
      >
        <span>{entry.locationName}</span>
        <span>&middot;</span>
        <time dateTime={entry.capturedAt.toISOString()}>{formattedDate}</time>
      </div>

      {entry.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            flexWrap: "wrap",
            marginBottom: "var(--space-6)",
          }}
        >
          {entry.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/search?tags=${tag.id}`}
              style={{
                fontSize: "var(--text-sm)",
                padding: "var(--space-1) var(--space-3)",
                backgroundColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
                borderRadius: "var(--radius-full)",
                textDecoration: "none",
              }}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      <MediaGallery media={media} />

      <MarkdownRenderer content={entry.body} />

      <div style={{ marginTop: "var(--space-8)" }}>
        <EntryMap lat={entry.lat} lng={entry.lng} title={entry.title} />
      </div>
    </main>
  );
}
