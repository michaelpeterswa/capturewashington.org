import type { BlueskyFacet } from "./caption";

const PDS_URL = "https://bsky.social";

interface BlueskySession {
  accessJwt: string;
  did: string;
}

export interface BlueskyPostInput {
  text: string;
  imageBuffer: Buffer;
  imageMimeType: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  facets: BlueskyFacet[];
}

export interface BlueskyPostResult {
  uri: string;
  cid: string;
}

async function createSession(): Promise<BlueskySession> {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;
  if (!handle || !password) {
    throw new Error("Bluesky credentials not configured");
  }

  const res = await fetch(`${PDS_URL}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: handle, password }),
  });

  if (!res.ok) {
    throw new Error(`Bluesky auth failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function uploadBlob(
  session: BlueskySession,
  imageBuffer: Buffer,
  mimeType: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${PDS_URL}/xrpc/com.atproto.repo.uploadBlob`, {
    method: "POST",
    headers: {
      "Content-Type": mimeType,
      Authorization: `Bearer ${session.accessJwt}`,
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!res.ok) {
    throw new Error(
      `Bluesky blob upload failed: ${res.status} ${await res.text()}`,
    );
  }

  const data = await res.json();
  return data.blob;
}

export async function postToBluesky(
  input: BlueskyPostInput,
): Promise<BlueskyPostResult> {
  const session = await createSession();

  const blob = await uploadBlob(
    session,
    input.imageBuffer,
    input.imageMimeType,
  );

  const record: Record<string, unknown> = {
    $type: "app.bsky.feed.post",
    text: input.text,
    createdAt: new Date().toISOString(),
    embed: {
      $type: "app.bsky.embed.images",
      images: [
        {
          alt: input.imageAlt,
          image: blob,
          aspectRatio: {
            width: input.imageWidth,
            height: input.imageHeight,
          },
        },
      ],
    },
  };

  if (input.facets.length > 0) {
    record.facets = input.facets;
  }

  const res = await fetch(`${PDS_URL}/xrpc/com.atproto.repo.createRecord`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: "app.bsky.feed.post",
      record,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Bluesky post creation failed: ${res.status} ${await res.text()}`,
    );
  }

  return res.json();
}
