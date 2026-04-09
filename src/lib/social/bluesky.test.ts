import { describe, it, expect, vi, beforeEach } from "vitest";
import { postToBluesky } from "./bluesky";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubEnv("BLUESKY_HANDLE", "test.bsky.social");
  vi.stubEnv("BLUESKY_APP_PASSWORD", "test-password");
});

describe("postToBluesky", () => {
  it("authenticates, uploads blob, and creates post", async () => {
    // createSession
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          accessJwt: "jwt-token",
          did: "did:plc:test123",
        }),
    });

    // uploadBlob
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          blob: {
            $type: "blob",
            ref: { $link: "bafkrei-test" },
            mimeType: "image/jpeg",
            size: 1000,
          },
        }),
    });

    // createRecord
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          uri: "at://did:plc:test123/app.bsky.feed.post/abc123",
          cid: "bafyrei-cid",
        }),
    });

    const result = await postToBluesky({
      text: "Test post #test",
      imageBuffer: Buffer.from("fake-image"),
      imageMimeType: "image/jpeg",
      imageWidth: 800,
      imageHeight: 600,
      imageAlt: "Test image",
      facets: [],
    });

    expect(result.uri).toContain("at://");
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Verify createSession call
    expect(mockFetch.mock.calls[0][0]).toContain("createSession");

    // Verify uploadBlob call
    expect(mockFetch.mock.calls[1][0]).toContain("uploadBlob");

    // Verify createRecord call
    expect(mockFetch.mock.calls[2][0]).toContain("createRecord");
  });

  it("throws on auth failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    await expect(
      postToBluesky({
        text: "Test",
        imageBuffer: Buffer.from("fake"),
        imageMimeType: "image/jpeg",
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: "",
        facets: [],
      }),
    ).rejects.toThrow();
  });
});
