import { describe, it, expect } from "vitest";
import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("converts title to kebab-case with cuid suffix", () => {
    const slug = generateSlug("Old City Hall, Spokane");
    expect(slug).toMatch(/^old-city-hall-spokane-[a-z0-9]{7}$/);
  });

  it("strips special characters", () => {
    const slug = generateSlug("St. Mary's Church (1920)");
    expect(slug).toMatch(/^st-mary-s-church-1920-[a-z0-9]{7}$/);
  });

  it("generates unique slugs for the same title", () => {
    const slug1 = generateSlug("Test Building");
    const slug2 = generateSlug("Test Building");
    expect(slug1).not.toBe(slug2);
  });

  it("handles empty string", () => {
    const slug = generateSlug("");
    expect(slug).toMatch(/^[a-z0-9]{7}$/);
  });
});
