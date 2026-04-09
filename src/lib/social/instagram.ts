const GRAPH_API = "https://graph.facebook.com/v21.0";

export interface InstagramPostInput {
  imageUrl: string;
  caption: string;
}

export interface InstagramPostResult {
  mediaId: string;
}

export interface TokenRefreshResult {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function postToInstagram(
  input: InstagramPostInput,
): Promise<InstagramPostResult> {
  const userId = process.env.INSTAGRAM_USER_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!userId || !token) {
    throw new Error("Instagram credentials not configured");
  }

  // Step 1: Create container
  const containerParams = new URLSearchParams({
    image_url: input.imageUrl,
    caption: input.caption,
    access_token: token,
  });

  const containerRes = await fetch(
    `${GRAPH_API}/${userId}/media?${containerParams}`,
    { method: "POST" },
  );

  if (!containerRes.ok) {
    throw new Error(
      `Instagram container creation failed: ${containerRes.status} ${await containerRes.text()}`,
    );
  }

  const { id: containerId } = await containerRes.json();

  // Step 2: Poll container status
  await pollContainerStatus(containerId, token);

  // Step 3: Publish
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: token,
  });

  const publishRes = await fetch(
    `${GRAPH_API}/${userId}/media_publish?${publishParams}`,
    { method: "POST" },
  );

  if (!publishRes.ok) {
    throw new Error(
      `Instagram publish failed: ${publishRes.status} ${await publishRes.text()}`,
    );
  }

  const { id: mediaId } = await publishRes.json();
  return { mediaId };
}

async function pollContainerStatus(
  containerId: string,
  token: string,
  maxAttempts = 10,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${token}`,
    );
    const data = await res.json();

    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new Error("Instagram container processing failed");
    }

    // Wait 2s between polls
    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error("Instagram container processing timed out");
}

/**
 * Refresh a long-lived Instagram token. Tokens last 60 days.
 * Call this when the token is within 7 days of expiry.
 */
export async function refreshInstagramToken(
  currentToken: string,
  appSecret: string,
): Promise<TokenRefreshResult> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appSecret, // Note: Instagram uses app ID here in some flows
    client_secret: appSecret,
    fb_exchange_token: currentToken,
  });

  const res = await fetch(`${GRAPH_API}/oauth/access_token?${params}`);

  if (!res.ok) {
    throw new Error(
      `Instagram token refresh failed: ${res.status} ${await res.text()}`,
    );
  }

  return res.json();
}
