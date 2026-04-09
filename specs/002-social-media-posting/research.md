# Research: Social Media Cross-Posting

## Bluesky AT Protocol API

### Decision: Use AT Protocol HTTP API directly

**Rationale**: The AT Protocol API is simple REST — two calls (upload blob + create record). No SDK required; `fetch` is sufficient. The `@atproto/api` npm package exists but adds unnecessary weight for just two endpoints.

**Alternatives considered**:

- `@atproto/api` SDK — heavier dependency, more features than needed
- Direct fetch — chosen, minimal surface area

### Key API Details

- **Auth**: App password → session token via `com.atproto.server.createSession`
- **Upload image**: `POST /xrpc/com.atproto.repo.uploadBlob` (binary body, Content-Type header)
- **Create post**: `POST /xrpc/com.atproto.repo.createRecord` with `app.bsky.feed.post` record
- **Image limit**: 1MB per image, up to 4 images per post
- **Text limit**: 300 graphemes (not bytes)
- **Hashtags**: Use facets with `app.bsky.richtext.facet#tag` type, byte-indexed
- **Links**: Use facets with `app.bsky.richtext.facet#link` type, byte-indexed
- **Image embed**: `app.bsky.embed.images` with blob ref, alt text, aspectRatio
- **Response**: Returns `uri` (at:// URI) and `cid` (content identifier)
- **PDS URL**: `https://bsky.social` (default, configurable)

### Image Handling

Images must be uploaded as raw bytes (not URL). The system must:

1. Fetch the image from CDN
2. Resize if >1MB
3. Strip EXIF metadata
4. Upload blob to Bluesky
5. Reference blob in post record

---

## Instagram Graph API

### Decision: Use Instagram API with Instagram Login flow

**Rationale**: Official supported path for Instagram Business/Creator accounts. Container-based publishing is the only sanctioned method for server-side image posting.

**Alternatives considered**:

- Facebook Login path — more complex permissions, requires Pages access
- Third-party services (Buffer) — adds vendor dependency, cost
- Instagram Login — chosen, simpler permission model

### Key API Details

- **Create container**: `POST /<IG_USER_ID>/media?image_url=<URL>&caption=<TEXT>&access_token=<TOKEN>`
- **Check status**: `GET /<CONTAINER_ID>?fields=status_code&access_token=<TOKEN>`
- **Publish**: `POST /<IG_USER_ID>/media_publish?creation_id=<CONTAINER_ID>&access_token=<TOKEN>`
- **Host**: `graph.instagram.com`
- **Image format**: JPEG only (must convert if WebP/PNG/AVIF)
- **Image source**: Must be publicly accessible URL (CDN works)
- **Caption limit**: 2,200 characters
- **Hashtags**: Plain text in caption (e.g., `#artdeco`), max 30 per post
- **Rate limit**: 100 published posts per 24 hours
- **Container expiry**: Unpublished containers expire after 24 hours

### Token Lifecycle

- **Short-lived token**: Obtained via OAuth, valid ~1 hour
- **Exchange to long-lived**: `GET /access_token?grant_type=ig_exchange_token&client_secret=<SECRET>&access_token=<SHORT_TOKEN>`
- **Long-lived validity**: 60 days
- **Refresh**: `GET /refresh_access_token?grant_type=ig_refresh_token&access_token=<LONG_TOKEN>`
- **Refresh window**: Token must be >24h old and <60 days old
- **Required permissions**: `instagram_business_basic`, `instagram_business_content_publish`

### Image Handling

Instagram fetches the image from the provided URL. The system must:

1. Ensure image is publicly accessible (CDN URL)
2. Convert to JPEG if source is WebP/PNG/AVIF
3. Ensure JPEG is within Instagram's size limits

---

## Cross-Posting Architecture

### Decision: Fire-and-forget with database tracking

**Rationale**: Cross-posting must not block the publish action (FR-008). Using async execution after the database update with a `SocialPost` record for tracking gives us: non-blocking publish, retry capability, status visibility.

**Alternatives considered**:

- Background job queue (BullMQ, etc.) — overkill for low-volume posting, adds infrastructure
- Webhook/event system — unnecessary complexity for single-trigger use case
- Inline async (fire-and-forget with `Promise` not awaited) — chosen, simple and sufficient for volume

### Execution Flow

1. Entry status updated to PUBLISHED in database
2. Check if SocialPost records already exist for this entry (duplicate guard)
3. If no existing posts: create SocialPost records with status=PENDING for each platform
4. Fire async function (not awaited) that:
   a. Fetches entry with media and tags
   b. Generates caption
   c. For Bluesky: fetch image → resize → upload blob → create post → update SocialPost
   d. For Instagram: convert to JPEG if needed → create container → poll status → publish → update SocialPost
5. API returns publish response immediately (not waiting for social posts)

### Caption Generation

Format: `{title} — {locationName}\n\n{hashtags}\n\n{link}`

Example:

```
Old City Hall — Spokane, WA

#historicbuildings #artdeco #spokane

https://capturewashington.org/entry/old-city-hall
```

- Bluesky: Full caption with link facet on the URL, tag facets on hashtags
- Instagram: Same format but without link (not clickable in captions)
- Hashtags: derived from entry tags, lowercased, spaces/special chars stripped
