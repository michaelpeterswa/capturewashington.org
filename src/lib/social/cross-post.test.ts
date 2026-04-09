import { describe, it, expect, vi } from "vitest";
import { shouldCrossPost } from "./cross-post";

vi.mock("@/lib/db", () => ({
  prisma: {
    socialPost: {
      findFirst: vi.fn(),
    },
  },
}));

describe("shouldCrossPost", () => {
  it("returns true for PUBLISHED entry with media", () => {
    expect(
      shouldCrossPost({
        status: "PUBLISHED",
        previousStatus: "DRAFT",
        hasMedia: true,
      }),
    ).toBe(true);
  });

  it("returns false for non-PUBLISHED status", () => {
    expect(
      shouldCrossPost({
        status: "DRAFT",
        previousStatus: "DRAFT",
        hasMedia: true,
      }),
    ).toBe(false);
  });

  it("returns false if already PUBLISHED", () => {
    expect(
      shouldCrossPost({
        status: "PUBLISHED",
        previousStatus: "PUBLISHED",
        hasMedia: true,
      }),
    ).toBe(false);
  });

  it("returns false if no media", () => {
    expect(
      shouldCrossPost({
        status: "PUBLISHED",
        previousStatus: "DRAFT",
        hasMedia: false,
      }),
    ).toBe(false);
  });
});
