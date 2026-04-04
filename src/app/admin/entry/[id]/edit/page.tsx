"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { MediaUploader } from "@/components/MediaUploader";
import { MediaGallery } from "@/components/MediaGallery";
import { EntryStatus } from "@/types";
import type { EntryDetail, MediaItem } from "@/types";

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
      <main style={{ padding: "var(--space-6)", textAlign: "center" }}>
        Loading...
      </main>
    );
  }

  const fieldStyle = {
    width: "100%",
    padding: "var(--space-2) var(--space-3)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-base)",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block" as const,
    marginBottom: "var(--space-1)",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-medium)" as const,
  };

  const btnStyle = {
    padding: "var(--space-1) var(--space-3)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-xs)",
    cursor: "pointer" as const,
    backgroundColor: "var(--color-surface)",
  };

  return (
    <main
      style={{
        maxWidth: "var(--max-width-prose)",
        margin: "0 auto",
        padding: "var(--space-6)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
        }}
      >
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-bold)",
          }}
        >
          Edit Entry
        </h1>
        <StatusBadge status={entry.status} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-6)",
        }}
      >
        <button
          onClick={() => handleStatusChange(EntryStatus.DRAFT)}
          style={btnStyle}
          disabled={entry.status === EntryStatus.DRAFT}
        >
          Set Draft
        </button>
        <button
          onClick={() => handleStatusChange(EntryStatus.PUBLISHED)}
          style={{ ...btnStyle, backgroundColor: "var(--color-success-light)" }}
          disabled={entry.status === EntryStatus.PUBLISHED}
        >
          Publish
        </button>
        <button
          onClick={() => handleStatusChange(EntryStatus.ARCHIVED)}
          style={btnStyle}
          disabled={entry.status === EntryStatus.ARCHIVED}
        >
          Archive
        </button>
        <button
          onClick={handleDelete}
          style={{
            ...btnStyle,
            color: "var(--color-error)",
            borderColor: "var(--color-error)",
            marginLeft: "auto",
          }}
        >
          Delete
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="title" style={labelStyle}>
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={entry.title}
            required
            maxLength={200}
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="body" style={labelStyle}>
            Body (Markdown)
          </label>
          <textarea
            id="body"
            name="body"
            defaultValue={entry.body}
            required
            rows={12}
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="locationName" style={labelStyle}>
            Location Name
          </label>
          <input
            id="locationName"
            name="locationName"
            defaultValue={entry.locationName}
            required
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="capturedAt" style={labelStyle}>
            Capture Date
          </label>
          <input
            id="capturedAt"
            name="capturedAt"
            type="date"
            defaultValue={entry.capturedAt.split("T")[0]}
            required
            style={fieldStyle}
          />
        </div>

        {error && (
          <p
            style={{
              color: "var(--color-error)",
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-sm)",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "var(--space-2) var(--space-6)",
            backgroundColor: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--font-medium)",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <hr
        style={{
          margin: "var(--space-8) 0",
          border: "none",
          borderTop: "1px solid var(--color-border)",
        }}
      />

      <h2
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: "var(--font-semibold)",
          marginBottom: "var(--space-4)",
        }}
      >
        Media ({media.length}/20)
      </h2>

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

      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          marginTop: "var(--space-4)",
        }}
      >
        Slug: {entry.slug} (immutable)
      </p>
    </main>
  );
}
