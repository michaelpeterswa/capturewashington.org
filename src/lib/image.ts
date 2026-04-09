import sharp from "sharp";
import type { ExifData } from "@/types";

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: "image/jpeg";
  width: number;
  height: number;
}

const MAX_BLOB_SIZE = 1_000_000; // 1MB (Bluesky limit)

/**
 * Process an image buffer: convert to JPEG, strip metadata, resize if needed.
 */
export async function processImageBuffer(
  input: Buffer,
): Promise<ProcessedImage> {
  let img = sharp(input).rotate().jpeg({ quality: 85 }).withMetadata({});

  const metadata = await sharp(input).metadata();
  let width = metadata.width ?? 1;
  let height = metadata.height ?? 1;

  // First pass — check size
  let output = await img.toBuffer();

  // If over limit, progressively reduce quality and size
  if (output.length > MAX_BLOB_SIZE) {
    const scale = Math.sqrt(MAX_BLOB_SIZE / output.length) * 0.9;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    img = sharp(input)
      .rotate()
      .resize(width, height, { fit: "inside" })
      .jpeg({ quality: 75 })
      .withMetadata({});
    output = await img.toBuffer();
  }

  // Final fallback if still too large
  if (output.length > MAX_BLOB_SIZE) {
    img = sharp(input)
      .rotate()
      .resize(800, 800, { fit: "inside" })
      .jpeg({ quality: 60 })
      .withMetadata({});
    output = await img.toBuffer();
  }

  const finalMeta = await sharp(output).metadata();

  return {
    buffer: output,
    mimeType: "image/jpeg",
    width: finalMeta.width ?? width,
    height: finalMeta.height ?? height,
  };
}

/**
 * Fetch an image from a URL and process it.
 */
export async function fetchAndProcessImage(
  url: string,
): Promise<ProcessedImage> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return processImageBuffer(Buffer.from(arrayBuffer));
}

function formatShutterSpeed(exposureTime: number): string {
  if (exposureTime >= 1) return `${exposureTime}s`;
  return `1/${Math.round(1 / exposureTime)}`;
}

/**
 * Extract EXIF metadata from an image buffer.
 */
export async function extractExifFromBuffer(
  input: Buffer,
): Promise<ExifData | null> {
  try {
    const exifr = await import("exifr");
    const parsed = await exifr.parse(input, {
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
    if (!parsed) return null;

    return {
      cameraMake: parsed.Make ?? null,
      cameraModel: parsed.Model ?? null,
      lensModel: parsed.LensModel ?? null,
      focalLength: parsed.FocalLength ?? null,
      aperture: parsed.FNumber ?? null,
      shutterSpeed: parsed.ExposureTime
        ? formatShutterSpeed(parsed.ExposureTime)
        : null,
      iso: parsed.ISO ?? null,
      whiteBalance:
        parsed.WhiteBalance === "Auto"
          ? "Auto"
          : parsed.WhiteBalance === "Manual"
            ? "Manual"
            : typeof parsed.WhiteBalance === "string"
              ? parsed.WhiteBalance
              : null,
      software: parsed.Software ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch an image from a URL and extract its EXIF metadata.
 */
export async function extractExifFromUrl(
  url: string,
): Promise<ExifData | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return extractExifFromBuffer(Buffer.from(arrayBuffer));
  } catch {
    return null;
  }
}
