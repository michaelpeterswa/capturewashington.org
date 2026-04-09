import { describe, it, expect } from "vitest";
import {
  generateCaption,
  generateHashtags,
  buildBlueskyFacets,
} from "./caption";

describe("generateHashtags", () => {
  it("converts tags to lowercase hashtags", () => {
    expect(generateHashtags(["Art Deco", "Spokane"])).toEqual([
      "#artdeco",
      "#spokane",
    ]);
  });

  it("strips special characters", () => {
    expect(generateHashtags(["Art & Crafts", "19th-Century"])).toEqual([
      "#artcrafts",
      "#19thcentury",
    ]);
  });

  it("returns empty array for no tags", () => {
    expect(generateHashtags([])).toEqual([]);
  });
});

describe("generateCaption", () => {
  it("builds caption from title, location, and tags", () => {
    const caption = generateCaption(
      "Old City Hall",
      "Spokane, WA",
      ["Art Deco", "Spokane"],
      "https://capturewashington.org/entry/old-city-hall",
    );
    expect(caption).toContain("Old City Hall");
    expect(caption).toContain("Spokane, WA");
    expect(caption).toContain("#artdeco");
    expect(caption).toContain("#spokane");
    expect(caption).toContain(
      "https://capturewashington.org/entry/old-city-hall",
    );
  });

  it("works with no tags", () => {
    const caption = generateCaption(
      "Some Building",
      "Seattle, WA",
      [],
      "https://capturewashington.org/entry/some-building",
    );
    expect(caption).toContain("Some Building");
    expect(caption).toContain("Seattle, WA");
    expect(caption).not.toContain("#");
  });

  it("handles special characters in title", () => {
    const caption = generateCaption(
      "O'Malley's & Sons Building",
      "Tacoma, WA",
      [],
      "https://capturewashington.org/entry/omalleys",
    );
    expect(caption).toContain("O'Malley's & Sons Building");
  });
});

describe("buildBlueskyFacets", () => {
  it("creates tag facets with correct byte offsets", () => {
    const text = "Building #artdeco #spokane";
    const facets = buildBlueskyFacets(
      text,
      ["#artdeco", "#spokane"],
      undefined,
    );
    expect(facets).toHaveLength(2);
    expect(facets[0].features[0].$type).toBe("app.bsky.richtext.facet#tag");
    expect(facets[0].features[0].tag).toBe("artdeco");
  });

  it("creates a link facet for the URL", () => {
    const text = "Visit https://capturewashington.org/entry/test";
    const facets = buildBlueskyFacets(
      text,
      [],
      "https://capturewashington.org/entry/test",
    );
    expect(facets).toHaveLength(1);
    expect(facets[0].features[0].$type).toBe("app.bsky.richtext.facet#link");
    expect(facets[0].features[0].uri).toBe(
      "https://capturewashington.org/entry/test",
    );
  });

  it("returns empty array when no hashtags or link", () => {
    expect(buildBlueskyFacets("Hello world", [], undefined)).toEqual([]);
  });
});
