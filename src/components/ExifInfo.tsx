import type { ExifData } from "@/types";

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

  const cameraName = [exif.cameraMake, exif.cameraModel]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
      <h3 className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-3">
        Shot Details
      </h3>
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
  );
}
