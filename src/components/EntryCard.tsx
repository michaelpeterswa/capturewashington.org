import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { EntryListItem, ExifData } from "@/types";

const CAMERA_MODEL_NAMES: Record<string, string> = {
  "ILCE-7M4": "a7 IV",
};

function friendlyCameraName(
  make: string | null | undefined,
  model: string | null | undefined,
): string | null {
  const parts: string[] = [];
  if (make)
    parts.push(make.charAt(0).toUpperCase() + make.slice(1).toLowerCase());
  if (model) {
    const friendly = CAMERA_MODEL_NAMES[model];
    parts.push(friendly ? `${friendly} (${model})` : model);
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

function ExifSummary({ exif }: { exif: ExifData }) {
  const parts: string[] = [];
  const camera = friendlyCameraName(exif.cameraMake, exif.cameraModel);
  if (camera) parts.push(camera);
  if (exif.focalLength) parts.push(`${exif.focalLength}mm`);
  if (exif.aperture) parts.push(`f/${exif.aperture}`);
  if (exif.shutterSpeed) parts.push(exif.shutterSpeed);
  if (exif.iso) parts.push(`ISO ${exif.iso}`);
  if (parts.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <p className="text-xs text-muted-foreground font-mono truncate">
        {parts.join(" \u00B7 ")}
      </p>
    </div>
  );
}

export function EntryCard({ entry }: { entry: EntryListItem }) {
  const formattedDate = new Date(entry.capturedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/entry/${entry.slug}`}
      className="group block w-full rounded-lg overflow-hidden bg-card border border-border/50 border-t-2 border-t-accent/25 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-accent/40"
    >
      <div className="bg-muted overflow-hidden">
        {entry.thumbnailUrl ? (
          <img
            src={entry.thumbnailUrl}
            alt={entry.title}
            className="w-full h-auto block transition-transform duration-600 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground py-16">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
              <path d="M9 9v.01" />
              <path d="M9 12v.01" />
              <path d="M9 15v.01" />
              <path d="M9 18v.01" />
            </svg>
            <span className="text-sm">No image</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-display text-xl sm:text-2xl font-normal leading-snug mb-2">
          {entry.title}
        </h2>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
          <span className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
              Loc
            </span>
            {entry.locationName}
          </span>
          <span className="text-accent/40">&middot;</span>
          <time dateTime={entry.capturedAt}>{formattedDate}</time>
        </div>
        {entry.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-3">
            {entry.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        {entry.exif && <ExifSummary exif={entry.exif} />}
      </div>
    </Link>
  );
}
