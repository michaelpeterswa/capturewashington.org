# Data Model: Social Media Cross-Posting

## New Entities

### SocialPost

Tracks each cross-post attempt per platform per entry.

| Field        | Type             | Constraints    | Notes                                                                     |
| ------------ | ---------------- | -------------- | ------------------------------------------------------------------------- |
| id           | String           | PK, cuid       | Auto-generated                                                            |
| entryId      | String           | FK → Entry.id  | Required                                                                  |
| platform     | SocialPlatform   | Enum           | BLUESKY, INSTAGRAM                                                        |
| status       | SocialPostStatus | Enum           | PENDING, SUCCESS, FAILED                                                  |
| externalUrl  | String?          | Nullable       | URL to the live post on the platform                                      |
| externalId   | String?          | Nullable       | Platform-specific post ID (at:// URI for Bluesky, media ID for Instagram) |
| errorMessage | String?          | Nullable       | Error details if status=FAILED                                            |
| postedAt     | DateTime?        | Nullable       | Timestamp of successful post                                              |
| createdAt    | DateTime         | Default: now() | When the record was created                                               |
| updatedAt    | DateTime         | Auto-updated   | Last modification                                                         |

**Uniqueness**: Unique constraint on `(entryId, platform)` — one post per platform per entry.

**Relationships**:

- Belongs to Entry (cascade delete)

### Enums

**SocialPlatform**:

- `BLUESKY`
- `INSTAGRAM`

**SocialPostStatus**:

- `PENDING` — cross-post queued/in-progress
- `SUCCESS` — posted successfully
- `FAILED` — posting failed (retryable)

## Modified Entities

### Entry (existing)

No schema changes. The relationship to SocialPost is added:

- Has many SocialPost (one per platform)

## State Transitions

```
PENDING → SUCCESS  (post created on platform)
PENDING → FAILED   (API error, timeout, auth failure)
FAILED  → PENDING  (admin triggers retry)
PENDING → SUCCESS  (retry succeeds)
```

## Environment Variables (new)

| Variable               | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| BLUESKY_HANDLE         | Bluesky account handle (e.g., capturewa.bsky.social)                  |
| BLUESKY_APP_PASSWORD   | App password for Bluesky API auth                                     |
| INSTAGRAM_USER_ID      | Instagram Business account user ID                                    |
| INSTAGRAM_ACCESS_TOKEN | Long-lived Instagram access token                                     |
| INSTAGRAM_APP_SECRET   | Instagram app secret (for token refresh)                              |
| SITE_URL               | Public site URL for entry links (e.g., https://capturewashington.org) |
