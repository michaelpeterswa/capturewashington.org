import { describe, it, expect } from "vitest";
import { validateUpload, validateEntryFields } from "./validation";

describe("validateUpload", () => {
  it("accepts a valid upload", () => {
    const result = validateUpload(1024 * 1024, "image/jpeg", 0);
    expect(result.valid).toBe(true);
  });

  it("rejects files exceeding 50MB", () => {
    const result = validateUpload(51 * 1024 * 1024, "image/jpeg", 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("50MB");
  });

  it("rejects unsupported content types", () => {
    const result = validateUpload(1024, "application/pdf", 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not accepted");
  });

  it("rejects when entry has 20 files already", () => {
    const result = validateUpload(1024, "image/jpeg", 20);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Maximum");
  });

  it("accepts all valid photo types", () => {
    for (const type of [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ]) {
      expect(validateUpload(1024, type, 0).valid).toBe(true);
    }
  });

  it("accepts all valid video types", () => {
    for (const type of ["video/mp4", "video/webm"]) {
      expect(validateUpload(1024, type, 0).valid).toBe(true);
    }
  });
});

describe("validateEntryFields", () => {
  it("accepts valid fields", () => {
    const result = validateEntryFields({
      title: "Old City Hall",
      body: "A historic building.",
      locationName: "Spokane, WA",
      lat: 47.6588,
      lng: -117.426,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects empty title", () => {
    const result = validateEntryFields({ title: "   " });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Title");
  });

  it("rejects title over 200 characters", () => {
    const result = validateEntryFields({ title: "a".repeat(201) });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("200");
  });

  it("rejects latitude out of range", () => {
    expect(validateEntryFields({ lat: 91 }).valid).toBe(false);
    expect(validateEntryFields({ lat: -91 }).valid).toBe(false);
  });

  it("rejects longitude out of range", () => {
    expect(validateEntryFields({ lng: 181 }).valid).toBe(false);
    expect(validateEntryFields({ lng: -181 }).valid).toBe(false);
  });
});
