"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export function ImageLightbox({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger nativeButton={false} render={<div className="cursor-zoom-in" />}>
        {children}
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="!max-w-[95vw] !sm:max-w-[95vw] max-h-[95vh] w-fit h-fit p-2 border-none bg-black/90 shadow-none ring-0 [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:bg-white/20 [&>[data-slot=dialog-close]]:rounded-full [&>[data-slot=dialog-close]]:hover:bg-white/40"
      >
        <VisuallyHidden>
          <DialogTitle>Image preview</DialogTitle>
        </VisuallyHidden>
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}
