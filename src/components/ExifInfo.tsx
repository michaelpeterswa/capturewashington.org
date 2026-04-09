import type { ExifData } from "@/types";

const CAMERA_MODEL_NAMES: Record<string, string> = {
  "ILCE-7M4": "a7 IV",
};

function friendlyCameraModel(model: string): string {
  const friendly = CAMERA_MODEL_NAMES[model];
  return friendly ? `${friendly} (${model})` : model;
}

function ExifRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function ExifInfo({ exif }: { exif: ExifData }) {
  const hasCamera = exif.cameraMake || exif.cameraModel;
  const hasAnyData =
    hasCamera ||
    exif.lensModel ||
    exif.focalLength ||
    exif.aperture ||
    exif.shutterSpeed ||
    exif.iso ||
    exif.whiteBalance ||
    exif.software;

  if (!hasAnyData) return null;

  const cameraName = [
    exif.cameraMake
      ? exif.cameraMake.charAt(0).toUpperCase() +
        exif.cameraMake.slice(1).toLowerCase()
      : undefined,
    exif.cameraModel ? friendlyCameraModel(exif.cameraModel) : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  // Build a compact summary for the collapsed state
  const summaryParts: string[] = [];
  if (cameraName) summaryParts.push(cameraName);
  if (exif.focalLength) summaryParts.push(`${exif.focalLength}mm`);
  if (exif.aperture) summaryParts.push(`f/${exif.aperture}`);
  if (exif.iso) summaryParts.push(`ISO ${exif.iso}`);

  return (
    <details className="mb-8 text-sm group">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none list-none flex items-center gap-2">
        <span className="text-xs transition-transform group-open:rotate-90">
          &#9656;
        </span>
        <span className="text-xs uppercase tracking-wide">Shot Details</span>
        {summaryParts.length > 0 && (
          <span className="font-mono text-xs text-muted-foreground/60 truncate">
            {summaryParts.join(" \u00B7 ")}
          </span>
        )}
      </summary>
      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        {cameraName && <ExifRow label="Camera" value={cameraName} />}
        {exif.lensModel && <ExifRow label="Lens" value={exif.lensModel} />}
        {exif.focalLength && (
          <ExifRow label="Focal Length" value={`${exif.focalLength}mm`} />
        )}
        {exif.aperture && (
          <ExifRow label="Aperture" value={`f/${exif.aperture}`} />
        )}
        {exif.shutterSpeed && (
          <ExifRow label="Shutter Speed" value={exif.shutterSpeed} />
        )}
        {exif.iso && <ExifRow label="ISO" value={String(exif.iso)} />}
        {exif.whiteBalance && (
          <ExifRow label="White Balance" value={exif.whiteBalance} />
        )}
        {exif.software && <ExifRow label="Edited With" value={exif.software} />}
      </div>
    </details>
  );
}
