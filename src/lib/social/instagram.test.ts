import { describe, it, expect, vi, beforeEach } from "vitest";
import { postToInstagram, refreshInstagramToken } from "./instagram";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubEnv("INSTAGRAM_USER_ID", "17841400000");
  vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "test-token");
  vi.stubEnv("INSTAGRAM_APP_SECRET", "test-secret");
});

describe("postToInstagram", () => {
  it("creates container, polls status, and publishes", async () => {
    // createContainer
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "container-123" }),
    });

    // pollContainerStatus (FINISHED)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status_code: "FINISHED" }),
    });

    // publishContainer
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "media-456" }),
    });

    const result = await postToInstagram({
      imageUrl: "https://cdn.example.com/photo.jpg",
      caption: "Test caption #test",
    });

    expect(result.mediaId).toBe("media-456");
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Verify container creation
    const containerCall = mockFetch.mock.calls[0][0] as string;
    expect(containerCall).toContain("/media");
    expect(containerCall).toContain("image_url");
  });

  it("polls until container is FINISHED", async () => {
    // createContainer
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "container-123" }),
    });

    // First poll: IN_PROGRESS
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status_code: "IN_PROGRESS" }),
    });

    // Second poll: FINISHED
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status_code: "FINISHED" }),
    });

    // publishContainer
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "media-456" }),
    });

    const result = await postToInstagram({
      imageUrl: "https://cdn.example.com/photo.jpg",
      caption: "Test",
    });

    expect(result.mediaId).toBe("media-456");
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it("throws on container ERROR status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "container-123" }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status_code: "ERROR" }),
    });

    await expect(
      postToInstagram({
        imageUrl: "https://cdn.example.com/photo.jpg",
        caption: "Test",
      }),
    ).rejects.toThrow("container processing failed");
  });
});

describe("refreshInstagramToken", () => {
  it("refreshes the token and returns new token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new-long-lived-token",
          token_type: "bearer",
          expires_in: 5184000,
        }),
    });

    const result = await refreshInstagramToken("old-token", "app-secret");
    expect(result.access_token).toBe("new-long-lived-token");
    expect(result.expires_in).toBe(5184000);
  });
});
