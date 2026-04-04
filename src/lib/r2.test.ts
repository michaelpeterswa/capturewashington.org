import { describe, it, expect } from "vitest";
import { getPublicUrl } from "./r2";

describe("r2", () => {
  it("getPublicUrl returns the CDN URL for a given r2Key", () => {
    const originalUrl = process.env.R2_PUBLIC_URL;
    process.env.R2_PUBLIC_URL = "https://media.example.com";
    expect(getPublicUrl("media/abc/photo.jpg")).toBe(
      "https://media.example.com/media/abc/photo.jpg",
    );
    process.env.R2_PUBLIC_URL = originalUrl;
  });

  it("getPublicUrl handles nested paths", () => {
    const originalUrl = process.env.R2_PUBLIC_URL;
    process.env.R2_PUBLIC_URL = "https://cdn.test.com";
    expect(getPublicUrl("media/entry123/sub/image.webp")).toBe(
      "https://cdn.test.com/media/entry123/sub/image.webp",
    );
    process.env.R2_PUBLIC_URL = originalUrl;
  });
});
