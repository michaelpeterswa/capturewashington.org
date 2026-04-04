import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MediaGallery } from "./MediaGallery";
import { MediaType } from "@/types";
import type { MediaItem } from "@/types";

const photoMedia: MediaItem = {
  id: "m1",
  url: "https://media.example.com/photo.jpg",
  type: MediaType.PHOTO,
  mimeType: "image/jpeg",
  sortOrder: 0,
};

const videoMedia: MediaItem = {
  id: "m2",
  url: "https://media.example.com/video.mp4",
  type: MediaType.VIDEO,
  mimeType: "video/mp4",
  sortOrder: 1,
};

describe("MediaGallery", () => {
  it("renders nothing when media is empty", () => {
    const { container } = render(<MediaGallery media={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders photos as img elements", () => {
    render(<MediaGallery media={[photoMedia]} />);
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", photoMedia.url);
  });

  it("renders videos with controls", () => {
    render(<MediaGallery media={[videoMedia]} />);
    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("src", videoMedia.url);
  });

  it("renders mixed media in order", () => {
    render(<MediaGallery media={[photoMedia, videoMedia]} />);
    expect(document.querySelector("img")).toBeInTheDocument();
    expect(document.querySelector("video")).toBeInTheDocument();
  });
});
