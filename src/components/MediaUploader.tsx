"use client";

import { useState, useRef } from "react";
import exifr from "exifr";
import {
  ACCEPTED_MEDIA_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_ENTRY,
} from "@/types";
import type { ExifData } from "@/types";

interface UploadedMedia {
  r2Key: string;
  type: "PHOTO" | "VIDEO";
  mimeType: string;
  fileSize: number;
}

function formatShutterSpeed(exposureTime: number): string {
  if (exposureTime >= 1) return `${exposureTime}s`;
  return `1/${Math.round(1 / exposureTime)}`;
}

async function extractExif(file: File): Promise<ExifData | null> {
  try {
    const data = await exifr.parse(file, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "WhiteBalance",
        "Software",
      ],
    });
    if (!data) return null;
    return {
      cameraMake: data.Make ?? null,
      cameraModel: data.Model ?? null,
      lensModel: data.LensModel ?? null,
      focalLength: data.FocalLength ?? null,
      aperture: data.FNumber ?? null,
      shutterSpeed: data.ExposureTime
        ? formatShutterSpeed(data.ExposureTime)
        : null,
      iso: data.ISO ?? null,
      whiteBalance:
        data.WhiteBalance === 0
          ? "Auto"
          : data.WhiteBalance === 1
            ? "Manual"
            : typeof data.WhiteBalance === "string"
              ? data.WhiteBalance
              : null,
      software: data.Software ?? null,
    };
  } catch {
    return null;
  }
}

export function MediaUploader({
  entryId,
  currentCount,
  onUploadComplete,
}: {
  entryId: string;
  currentCount: number;
  onUploadComplete: (media: UploadedMedia) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError(null);
    setProgress(null);

    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum is 50 MB.`);
      return;
    }

    if (
      !ACCEPTED_MEDIA_TYPES.includes(
        file.type as (typeof ACCEPTED_MEDIA_TYPES)[number],
      )
    ) {
      setError(`File type "${file.type}" is not supported.`);
      return;
    }

    if (currentCount >= MAX_FILES_PER_ENTRY) {
      setError(`Maximum of ${MAX_FILES_PER_ENTRY} files per entry.`);
      return;
    }

    setUploading(true);
    setProgress("Reading image metadata...");

    let exif: ExifData | null = null;
    if (file.type.startsWith("image/")) {
      exif = await extractExif(file);
    }

    setProgress("Getting upload URL...");

    try {
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          entryId,
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json();
        throw new Error(data.error || "Failed to get upload URL");
      }

      const { uploadUrl, r2Key } = await presignRes.json();

      setProgress("Uploading file...");
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload to storage failed");
      }

      setProgress("Saving...");
      const mediaRes = await fetch(`/api/entries/${entryId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          r2Key,
          type: file.type.startsWith("video/") ? "VIDEO" : "PHOTO",
          mimeType: file.type,
          fileSize: file.size,
          ...(exif && { exif }),
        }),
      });

      if (!mediaRes.ok) {
        throw new Error("Failed to save media record");
      }

      onUploadComplete({
        r2Key,
        type: file.type.startsWith("video/") ? "VIDEO" : "PHOTO",
        mimeType: file.type,
        fileSize: file.size,
      });

      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        padding: "var(--space-4)",
        border: "2px dashed var(--color-border)",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MEDIA_TYPES.join(",")}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
        style={{ marginBottom: "var(--space-2)" }}
      />
      {progress && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          {progress}
        </p>
      )}
      {error && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-error)",
            marginTop: "var(--space-2)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
