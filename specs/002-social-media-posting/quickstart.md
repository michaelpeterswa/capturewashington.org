# Quickstart: Social Media Cross-Posting

## Prerequisites

1. **Bluesky account** with an app password generated at [bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
2. **Instagram Business/Creator account** connected to a Facebook Page
3. **Instagram app** registered at [developers.facebook.com](https://developers.facebook.com) with `instagram_business_basic` and `instagram_business_content_publish` permissions

## Environment Setup

Add to `.env.local`:

```bash
# Bluesky
BLUESKY_HANDLE=capturewa.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Instagram
INSTAGRAM_USER_ID=17841400000000000
INSTAGRAM_ACCESS_TOKEN=IGQ...
INSTAGRAM_APP_SECRET=your_app_secret

# Site URL (for entry links in captions)
SITE_URL=https://capturewashington.org
```

## Database Migration

```bash
just db-push    # or: bunx prisma db push
```

This adds the `SocialPost` table and `SocialPlatform`/`SocialPostStatus` enums.

## How It Works

1. Create an entry with a photo in the admin panel
2. Click **Publish** — the entry goes live on the site
3. Within ~30 seconds, the system automatically posts to Bluesky and Instagram
4. Check the entry edit page for cross-post status (Posted / Failed / Retry)

## Testing

- Publish an entry with a photo and verify posts appear on both platforms
- Publish an entry without a photo — no social posts should be created
- Check the edit page for status indicators after publishing

## Troubleshooting

- **Bluesky fails**: Check `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD` are correct
- **Instagram fails**: Token may have expired. Check logs, then refresh token or re-authenticate
- **Image too large**: System auto-resizes, but if source is >10MB the fetch may timeout
- **Duplicate prevention**: Re-publishing an entry will not create new social posts
