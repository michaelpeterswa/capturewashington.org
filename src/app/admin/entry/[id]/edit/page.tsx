"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { MediaUploader } from "@/components/MediaUploader";
import { MediaGallery } from "@/components/MediaGallery";
import { EntryStatus } from "@/types";
import type { EntryDetail, MediaItem } from "@/types";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const MarkdownEditor = dynamic(
  () =>
    import("@/components/MarkdownEditor").then((m) => ({
      default: m.MarkdownEditor,
    })),
  { ssr: false },
);

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    fetch(`/api/entries/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setEntry(data);
        setMedia(data.media || []);
      });
  }, [id]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          body: form.get("body"),
          locationName: form.get("locationName"),
          capturedAt: form.get("capturedAt"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: EntryStatus) {
    await fetch(`/api/entries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setEntry((prev) => (prev ? { ...prev, status } : null));
  }

  async function handleDelete() {
    if (!confirm("Soft-delete this entry? It can be restored later.")) return;
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    router.push("/admin");
  }

  if (!entry) {
    return (
      <div className="p-4 lg:p-6 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl space-y-6">
      {/* Status & actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Edit Entry</CardTitle>
            <StatusBadge status={entry.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(EntryStatus.DRAFT)}
              disabled={entry.status === EntryStatus.DRAFT}
            >
              Set Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(EntryStatus.PUBLISHED)}
              disabled={entry.status === EntryStatus.PUBLISHED}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(EntryStatus.ARCHIVED)}
              disabled={entry.status === EntryStatus.ARCHIVED}
            >
              Archive
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="ml-auto"
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={entry.title}
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>Body (Markdown)</Label>
              <MarkdownEditor name="body" defaultValue={entry.body} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                name="locationName"
                defaultValue={entry.locationName}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capturedAt">Capture Date</Label>
              <Input
                id="capturedAt"
                name="capturedAt"
                type="date"
                defaultValue={entry.capturedAt.split("T")[0]}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>Media ({media.length}/20)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaGallery media={media} />
          <MediaUploader
            entryId={id}
            currentCount={media.length}
            onUploadComplete={(uploaded) => {
              setMedia((prev) => [
                ...prev,
                {
                  id: uploaded.r2Key,
                  url: uploaded.r2Key,
                  type: uploaded.type,
                  mimeType: uploaded.mimeType,
                  sortOrder: prev.length,
                },
              ]);
            }}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Slug: {entry.slug} (immutable)
      </p>
    </div>
  );
}
