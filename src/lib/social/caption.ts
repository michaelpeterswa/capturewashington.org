export interface BlueskyFacet {
  index: { byteStart: number; byteEnd: number };
  features: Array<{ $type: string; tag?: string; uri?: string }>;
}

/**
 * Convert tag names to hashtag format.
 * "Art Deco" → "#artdeco"
 */
export function generateHashtags(tags: string[]): string[] {
  return tags
    .map((tag) => "#" + tag.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((h) => h.length > 1);
}

/**
 * Build a social media caption from entry fields.
 * Format: Title — Location\n\n#hashtags\n\nlink
 */
export function generateCaption(
  title: string,
  locationName: string,
  tagNames: string[],
  entryUrl: string,
): string {
  const parts: string[] = [`${title} — ${locationName}`];

  const hashtags = generateHashtags(tagNames);
  if (hashtags.length > 0) {
    parts.push(hashtags.join(" "));
  }

  parts.push(entryUrl);

  return parts.join("\n\n");
}

/**
 * Build Bluesky rich text facets for hashtags and a link.
 * Facets use UTF-8 byte offsets.
 */
export function buildBlueskyFacets(
  text: string,
  hashtags: string[],
  url: string | undefined,
): BlueskyFacet[] {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  const facets: BlueskyFacet[] = [];

  for (const hashtag of hashtags) {
    const hashtagBytes = encoder.encode(hashtag);
    const idx = findByteIndex(textBytes, hashtagBytes);
    if (idx === -1) continue;

    facets.push({
      index: { byteStart: idx, byteEnd: idx + hashtagBytes.byteLength },
      features: [
        {
          $type: "app.bsky.richtext.facet#tag",
          tag: hashtag.replace(/^#/, ""),
        },
      ],
    });
  }

  if (url) {
    const urlBytes = encoder.encode(url);
    const idx = findByteIndex(textBytes, urlBytes);
    if (idx !== -1) {
      facets.push({
        index: { byteStart: idx, byteEnd: idx + urlBytes.byteLength },
        features: [{ $type: "app.bsky.richtext.facet#link", uri: url }],
      });
    }
  }

  return facets;
}

function findByteIndex(haystack: Uint8Array, needle: Uint8Array): number {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}
