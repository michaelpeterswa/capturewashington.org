# API Contract: Social Media Cross-Posting

## Internal API (triggered by entry publish flow)

No new public API endpoints. Cross-posting is triggered internally when the existing `PUT /api/entries/[id]` endpoint processes a status change to PUBLISHED.

## Retry Endpoint

### POST /api/entries/[id]/social/retry

Retries a failed cross-post for a specific platform.

**Auth**: Admin or Super Admin

**Request Body**:

```json
{
  "platform": "BLUESKY" | "INSTAGRAM"
}
```

**Success Response** (200):

```json
{
  "id": "social-post-id",
  "platform": "BLUESKY",
  "status": "PENDING"
}
```

**Error Responses**:

- 401: Unauthorized
- 403: Not admin
- 404: Entry not found or no SocialPost record for platform
- 409: Post already succeeded (cannot retry a successful post)

## Social Post Status (embedded in entry detail)

The existing `GET /api/entries/[id]` response is extended with:

```json
{
  "id": "entry-id",
  "title": "...",
  "socialPosts": [
    {
      "platform": "BLUESKY",
      "status": "SUCCESS",
      "externalUrl": "https://bsky.app/profile/capturewa.bsky.social/post/3k4duaz5vfs2b",
      "postedAt": "2026-04-07T12:00:00Z"
    },
    {
      "platform": "INSTAGRAM",
      "status": "FAILED",
      "errorMessage": "Token expired",
      "postedAt": null
    }
  ]
}
```

## External API Contracts (consumed)

### Bluesky AT Protocol

- **Create session**: `POST https://bsky.social/xrpc/com.atproto.server.createSession`
- **Upload blob**: `POST https://bsky.social/xrpc/com.atproto.repo.uploadBlob`
- **Create record**: `POST https://bsky.social/xrpc/com.atproto.repo.createRecord`

### Instagram Graph API

- **Create container**: `POST https://graph.instagram.com/<USER_ID>/media`
- **Check status**: `GET https://graph.instagram.com/<CONTAINER_ID>?fields=status_code`
- **Publish**: `POST https://graph.instagram.com/<USER_ID>/media_publish`
- **Refresh token**: `GET https://graph.instagram.com/refresh_access_token`
