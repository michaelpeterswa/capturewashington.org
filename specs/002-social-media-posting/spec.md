# Feature Specification: Social Media Cross-Posting

**Feature Branch**: `002-social-media-posting`
**Created**: 2026-04-07
**Status**: Draft
**Input**: User description: "I now want to have the ability to post to instagram and bluesky on posting of a new image, the post should contain the image, and a safe text content, along with relevant social tags."

## Clarifications

### Session 2026-04-07

- Q: Should the system use the existing public CDN URL or generate temporary presigned URLs for Instagram image fetching? → A: Use existing public CDN URL (`cdn.capturewashington.org`). Photos are already publicly accessible.
- Q: Should Instagram token refresh be automatic or require manual re-authentication? → A: Automatic refresh — system refreshes the token before it expires.
- Q: Should the feature retroactively cross-post existing published entries? → A: New only — only entries published after the feature is deployed get cross-posted.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Automatic Bluesky Post on Publish (Priority: P1)

As an admin, when I publish a new entry with a photo, the system automatically creates a post on Bluesky containing the entry's image, a caption derived from the entry title and location, and relevant hashtags — so that the historic building is shared with followers without any extra manual steps.

**Why this priority**: Bluesky has an open, well-documented API (AT Protocol) that does not require third-party business accounts. This is the fastest path to delivering cross-posting value and validates the full pipeline (trigger → caption generation → image upload → post creation).

**Independent Test**: Can be fully tested by publishing an entry with a photo and verifying a new post appears on the connected Bluesky account with the correct image, caption text, and tags.

**Acceptance Scenarios**:

1. **Given** an entry in DRAFT status with at least one photo, **When** the admin changes the status to PUBLISHED, **Then** a post is created on Bluesky within 30 seconds containing the entry's first photo, a caption with the entry title and location, and relevant hashtags.
2. **Given** an entry that is already PUBLISHED, **When** the admin updates the entry content, **Then** no duplicate Bluesky post is created.
3. **Given** an entry with no photos, **When** the admin publishes it, **Then** no Bluesky post is created (image is required for social posts).

---

### User Story 2 - Automatic Instagram Post on Publish (Priority: P2)

As an admin, when I publish a new entry with a photo, the system automatically creates a post on Instagram containing the entry's image and an auto-generated caption with relevant hashtags — so that the historic building reaches the Instagram audience without manual effort.

**Why this priority**: Instagram has a larger audience for visual content but requires more complex integration (Facebook Business account, Instagram Graph API, container-based publishing flow). Building on the same trigger and caption pipeline from P1, this extends reach to a second platform.

**Independent Test**: Can be fully tested by publishing an entry with a photo and verifying a new post appears on the connected Instagram Business account with the correct image and caption.

**Acceptance Scenarios**:

1. **Given** an entry in DRAFT status with at least one photo, **When** the admin changes the status to PUBLISHED, **Then** a post is created on Instagram within 60 seconds containing the entry's first photo and a caption with title, location, and hashtags.
2. **Given** the Instagram API returns an error (e.g., rate limit, auth expired), **When** the publish action completes, **Then** the entry is still published successfully, the error is logged, and the admin sees a notification that Instagram posting failed.
3. **Given** an entry that was already cross-posted to Instagram, **When** the admin republishes or updates the entry, **Then** no duplicate Instagram post is created.

---

### User Story 3 - Cross-Post Status Visibility (Priority: P3)

As an admin, when viewing an entry in the admin panel, I can see whether the entry has been successfully cross-posted to each platform — so that I know which entries have been shared and can identify any failures.

**Why this priority**: Provides visibility into the cross-posting pipeline. Without this, the admin has no way to know if posts succeeded or failed without checking each platform manually.

**Independent Test**: Can be fully tested by publishing an entry, then viewing it in the admin edit page and confirming platform status indicators show success/failure/pending for each connected platform.

**Acceptance Scenarios**:

1. **Given** a published entry that was successfully cross-posted to both platforms, **When** the admin views the entry edit page, **Then** both Bluesky and Instagram show a "Posted" status with the date and a link to the live post.
2. **Given** a published entry where Instagram posting failed, **When** the admin views the entry edit page, **Then** Instagram shows a "Failed" status with an option to retry.
3. **Given** a DRAFT entry that has never been published, **When** the admin views the entry edit page, **Then** no cross-post status is shown.

---

### Edge Cases

- What happens when the admin publishes an entry but social media credentials have expired or are not configured? The entry publishes successfully; social posting fails silently with a logged error and visible failure status on the edit page.
- What happens when the image exceeds platform size limits? The system resizes/compresses the image to meet platform requirements before uploading.
- What happens when the admin archives and then re-publishes an entry? No new social posts are created if the entry was previously cross-posted (tracked by post record).
- What happens when both platforms fail simultaneously? Both failures are logged independently and shown separately on the edit page with individual retry options.
- What happens when the entry title or location contains special characters or emoji? Caption generation sanitizes content to be safe for both platforms (no unsupported characters, appropriate length limits).
- What happens when an entry was published before the feature was deployed? No cross-post is created. Only entries whose publish action occurs after the feature is live are eligible.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST automatically create a Bluesky post when an entry transitions from any non-published status to PUBLISHED and the entry has at least one photo.
- **FR-002**: System MUST automatically create an Instagram post via the Instagram Graph API when an entry transitions from any non-published status to PUBLISHED and the entry has at least one photo.
- **FR-003**: System MUST generate a caption automatically from the entry's title, location name, and tags formatted as hashtags (e.g., "Old City Hall — Spokane, WA #historicbuildings #artdeco").
- **FR-004**: System MUST include the entry's first photo in both social media posts, using the existing public CDN URL for the image.
- **FR-005**: System MUST NOT create duplicate social posts if an entry is updated, re-published, or the status is toggled back to PUBLISHED after being previously cross-posted.
- **FR-006**: System MUST record the outcome of each cross-post attempt (success with external post URL, or failure with error details) per platform per entry.
- **FR-007**: System MUST allow the admin to retry a failed cross-post from the entry edit page.
- **FR-008**: System MUST NOT block or fail the entry publish action if social media posting fails — publishing and cross-posting are independent operations.
- **FR-009**: System MUST sanitize caption text to comply with each platform's content policies (character limits, allowed characters).
- **FR-010**: System MUST resize or compress images to meet each platform's upload requirements before posting.
- **FR-011**: System MUST generate hashtags from the entry's tags, converting tag names to lowercase alphanumeric hashtag format (e.g., tag "Art Deco" becomes "#artdeco").
- **FR-012**: System MUST append a link back to the entry on capturewashington.org in the caption (for Bluesky; Instagram does not support clickable links in captions).
- **FR-013**: System MUST automatically refresh Instagram long-lived tokens before they expire, without requiring manual admin intervention.
- **FR-014**: System MUST only cross-post entries whose publish action occurs after the feature is deployed — no retroactive posting of previously published entries.

### Key Entities

- **SocialPost**: Represents a cross-post attempt to a specific platform for a specific entry. Key attributes: platform (Bluesky/Instagram), status (pending/success/failed), external post URL, error message, timestamp, associated entry.
- **SocialCredential**: Stores authentication credentials for each platform. Key attributes: platform, access tokens, refresh tokens, expiration, configuration status.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Published entries with photos appear on connected Bluesky and Instagram accounts within 60 seconds of publishing.
- **SC-002**: Cross-post captions accurately reflect the entry's title, location, and tags with no manual editing required.
- **SC-003**: Admin can see cross-post status for all published entries without leaving the admin panel.
- **SC-004**: Failed cross-posts can be retried with a single action and succeed when the underlying issue is resolved.
- **SC-005**: Entry publishing never fails or is delayed due to social media integration issues.
- **SC-006**: Zero duplicate posts are created across any platform for the same entry.
- **SC-007**: Instagram token remains valid continuously without manual re-authentication.

## Assumptions

- The admin has an existing Instagram Business or Creator account connected to a Facebook Page with the necessary permissions for the Instagram Graph API.
- The admin has or will create a Bluesky account with an app password for API access.
- Social media credentials will be configured once by the admin and stored securely as environment variables or encrypted settings.
- The first photo attached to an entry (by sort order) is the one used for social posts.
- Hashtags are derived solely from the entry's tags — no AI-generated or keyword-extracted tags.
- Bluesky's AT Protocol and Instagram's Graph API are available and stable.
- Image resizing happens server-side before uploading to each platform.
- Cross-posting happens asynchronously after the publish action completes (fire-and-forget with status tracking).
- The site URL for entry links is derived from the `NEXTAUTH_URL` environment variable or a dedicated `SITE_URL` setting.
- Photos are publicly accessible via the CDN (`cdn.capturewashington.org`) — no presigned URLs needed for Instagram image fetching.
