"use client";

import type { MediaItem } from "@/types";
import { MediaType } from "@/types";
import { ImageLightbox } from "@/components/ImageLightbox";

export function MediaGallery({ media }: { media: MediaItem[] }) {
  if (media.length === 0) return null;

  const item = media[0];

  if (item.type === MediaType.VIDEO) {
    return (
      <div className="rounded-lg overflow-hidden bg-muted aspect-video mb-8">
        <video
          src={item.url}
          controls
          preload="metadata"
          className="w-full h-full"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <ImageLightbox src={item.url} alt="">
        <img
          src={item.url}
          alt=""
          className="w-full h-auto rounded-lg cursor-zoom-in"
          loading="lazy"
        />
      </ImageLightbox>
    </div>
  );
}
