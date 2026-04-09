import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { processImageBuffer } from "./image";

async function createTestImage(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 100, b: 50 },
    },
  })
    .png()
    .toBuffer();
}

describe("processImageBuffer", () => {
  it("returns a JPEG buffer for valid input", async () => {
    const input = await createTestImage(100, 100);
    const result = await processImageBuffer(input);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.buffer.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe("image/jpeg");
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });

  it("keeps image under 1MB", async () => {
    const input = await createTestImage(100, 100);
    const result = await processImageBuffer(input);
    expect(result.buffer.length).toBeLessThanOrEqual(1_000_000);
  });
});
