"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MarkdownEditor = dynamic(
  () =>
    import("@/components/MarkdownEditor").then((m) => ({
      default: m.MarkdownEditor,
    })),
  { ssr: false },
);

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

  return (
    <div className="p-4 lg:p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label>Body (Markdown)</Label>
              <MarkdownEditor name="body" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                name="locationName"
                required
                placeholder="e.g. Spokane, WA"
              />
            </div>

            <div className="space-y-2">
              <Label>Location (click map)</Label>
              <LocationPicker
                onLocationChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capturedAt">Capture Date</Label>
              <Input id="capturedAt" name="capturedAt" type="date" required />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Entry (Draft)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
