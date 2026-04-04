"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () =>
    import("@/components/LocationPicker").then((m) => ({
      default: m.LocationPicker,
    })),
  { ssr: false },
);

export default function NewEntryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      body: form.get("body"),
      locationName: form.get("locationName"),
      lat,
      lng,
      capturedAt: form.get("capturedAt"),
    };

    if (!lat || !lng) {
      setError("Please select a location on the map.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create entry");
      }

      const data = await res.json();
      router.push(`/admin/entry/${data.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
    } finally {
      setSaving(false);
    }
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
    display: "block",
    marginBottom: "var(--space-1)",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-medium)" as const,
  };

  return (
    <main
      style={{
        maxWidth: "var(--max-width-prose)",
        margin: "0 auto",
        padding: "var(--space-6)",
      }}
    >
      <h1
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--font-bold)",
          marginBottom: "var(--space-6)",
        }}
      >
        New Entry
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="title" style={labelStyle}>
            Title
          </label>
          <input
            id="title"
            name="title"
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
            required
            placeholder="e.g. Spokane, WA"
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label style={labelStyle}>Location (click map)</label>
          <LocationPicker
            onLocationChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }}
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
          {saving ? "Creating..." : "Create Entry (Draft)"}
        </button>
      </form>
    </main>
  );
}
