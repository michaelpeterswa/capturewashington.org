# Tasks: Social Media Cross-Posting

**Input**: Design documents from `/specs/002-social-media-posting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-social.md

**Tests**: Included per constitution (Test-First, NON-NEGOTIABLE).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Schema changes, environment config, shared module scaffolding

- [x] T001 Add SocialPlatform and SocialPostStatus enums and SocialPost model to prisma/schema.prisma
- [x] T002 Run Prisma db push to apply schema changes
- [x] T003 Add new environment variables to .env.example (BLUESKY_HANDLE, BLUESKY_APP_PASSWORD, INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_APP_SECRET, SITE_URL)
- [x] T004 [P] Create src/lib/social/ directory structure (bluesky.ts, instagram.ts, caption.ts, cross-post.ts placeholder files)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Caption generation and image processing — shared by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests

- [x] T005 [P] Write tests for caption generation in src/lib/social/caption.test.ts (title + location + tags → formatted caption with hashtags, edge cases: special chars, empty tags, long titles)
- [x] T006 [P] Write tests for image processing in src/lib/image.test.ts (resize to under 1MB, JPEG conversion, metadata stripping)

### Implementation

- [x] T007 Implement caption generation in src/lib/social/caption.ts (generateCaption, generateHashtags, buildBlueskyFacets for tag and link facets using UTF-8 byte offsets)
- [x] T008 Implement image processing in src/lib/image.ts (fetchAndProcessImage: fetch from CDN URL, resize if >1MB, convert to JPEG, strip EXIF, return buffer + dimensions)

**Checkpoint**: Caption and image utilities ready. Tests pass.

---

## Phase 3: User Story 1 — Automatic Bluesky Post on Publish (Priority: P1) 🎯 MVP

**Goal**: When an entry is published with a photo, automatically post to Bluesky with image, caption, and hashtag/link facets.

**Independent Test**: Publish an entry with a photo → verify post appears on Bluesky with correct image, caption, and tags.

### Tests

- [x] T009 [P] [US1] Write tests for Bluesky client in src/lib/social/bluesky.test.ts (createSession mock, uploadBlob mock, createPost mock, error handling, auth failure)
- [x] T010 [P] [US1] Write tests for cross-post orchestrator in src/lib/social/cross-post.test.ts (triggers on PUBLISHED with photo, skips if no photo, skips if SocialPost already exists for platform, creates PENDING record, updates to SUCCESS/FAILED)

### Implementation

- [x] T011 [US1] Implement Bluesky client in src/lib/social/bluesky.ts (createSession with handle+appPassword, uploadBlob with image bytes, createPost with record+embed+facets, returns post URI)
- [x] T012 [US1] Implement cross-post orchestrator in src/lib/social/cross-post.ts (triggerCrossPost: check duplicate guard via SocialPost query, create PENDING records, dispatch async postToBluesky, update SocialPost status on success/failure)
- [x] T013 [US1] Modify PUT handler in src/app/api/entries/[id]/route.ts to call triggerCrossPost after status changes to PUBLISHED (fire-and-forget, not awaited, only for entries with media)

**Checkpoint**: Publishing an entry with a photo triggers a Bluesky post. Tests pass. Entry publish is not blocked.

---

## Phase 4: User Story 2 — Automatic Instagram Post on Publish (Priority: P2)

**Goal**: When an entry is published with a photo, also post to Instagram via Graph API container-based flow.

**Independent Test**: Publish an entry with a photo → verify post appears on Instagram with correct image and caption.

### Tests

- [x] T014 [P] [US2] Write tests for Instagram client in src/lib/social/instagram.test.ts (createContainer mock, pollContainerStatus mock, publishContainer mock, token refresh mock, JPEG-only enforcement, error handling)

### Implementation

- [x] T015 [US2] Implement Instagram client in src/lib/social/instagram.ts (createContainer with image_url+caption, pollContainerStatus with retry loop, publishContainer, refreshToken with grant_type=ig_refresh_token)
- [x] T016 [US2] Extend cross-post orchestrator in src/lib/social/cross-post.ts to dispatch postToInstagram alongside postToBluesky (both fire-and-forget, independent failure handling)
- [x] T017 [US2] Add Instagram token refresh check to src/lib/social/instagram.ts (check token expiry, auto-refresh if within 7 days of expiration, log refresh events)

**Checkpoint**: Publishing an entry with a photo triggers both Bluesky and Instagram posts. Failures are independent per platform.

---

## Phase 5: User Story 3 — Cross-Post Status Visibility (Priority: P3)

**Goal**: Admin can see cross-post status (posted/failed/retry) on the entry edit page.

**Independent Test**: Publish an entry → view edit page → see Bluesky and Instagram status badges with posted date or failure message and retry button.

### Tests

- [x] T018 [P] [US3] Write test for retry endpoint in src/app/api/entries/[id]/social/retry/route.test.ts (retries FAILED post, rejects retry of SUCCESS post, auth check)

### Implementation

- [x] T019 [US3] Extend GET /api/entries/[id] response in src/app/api/entries/[id]/route.ts to include socialPosts array (platform, status, externalUrl, errorMessage, postedAt)
- [x] T020 [US3] Create retry endpoint in src/app/api/entries/[id]/social/retry/route.ts (POST, accepts platform, resets SocialPost to PENDING, re-triggers cross-post for that platform)
- [x] T021 [US3] Add social post status card to src/app/admin/entry/[id]/edit/page.tsx (show Bluesky/Instagram status badges, external link if posted, error message if failed, retry button if failed)

**Checkpoint**: Admin has full visibility into cross-post outcomes with retry capability.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, edge cases, documentation

- [x] T022 [P] Update .env.example with all new variables and inline comments
- [x] T023 [P] Update README.md with social media setup instructions
- [x] T024 Run all tests, lint, format, build — fix any failures
- [ ] T025 Run quickstart.md validation (end-to-end: configure credentials, publish entry, verify posts on both platforms)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (schema must exist for imports)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs caption + image utils)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (needs caption + image utils) + Phase 3 (orchestrator exists)
- **User Story 3 (Phase 5)**: Depends on Phase 3 (SocialPost records must exist to display)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (Bluesky)**: Independent after Foundational — creates the orchestrator and SocialPost records
- **US2 (Instagram)**: Extends the orchestrator from US1 — should follow US1 sequentially
- **US3 (Status UI)**: Reads SocialPost records — can start after US1 creates them, but benefits from US2 also being done

### Parallel Opportunities

- T005 + T006: Caption and image tests in parallel
- T007 + T008: Caption and image implementations in parallel (after their tests)
- T009 + T010: Bluesky client and orchestrator tests in parallel
- T014 + T018: Instagram tests and retry endpoint tests in parallel (different stories but both are test-writing)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Write tests in parallel:
Task: T005 "Caption generation tests in src/lib/social/caption.test.ts"
Task: T006 "Image processing tests in src/lib/image.test.ts"

# Implement in parallel (after tests):
Task: T007 "Caption generation in src/lib/social/caption.ts"
Task: T008 "Image processing in src/lib/image.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (schema + env + scaffolding)
2. Complete Phase 2: Foundational (caption + image processing)
3. Complete Phase 3: User Story 1 (Bluesky posting)
4. **STOP and VALIDATE**: Publish an entry → verify Bluesky post appears
5. Deploy if ready — Instagram and status UI can follow

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Bluesky) → Test → Deploy (MVP!)
3. Add US2 (Instagram) → Test → Deploy
4. Add US3 (Status UI) → Test → Deploy
5. Polish → Final deploy

---

## Notes

- Constitution requires TDD: all test tasks must be completed and fail before implementation tasks
- Fire-and-forget async: cross-posting must never block the publish API response
- Bluesky requires image bytes upload; Instagram accepts CDN URL directly
- Instagram images must be JPEG; Bluesky accepts JPEG and PNG
- Facets for Bluesky use UTF-8 byte offsets, not character indices
- SocialPost unique constraint (entryId, platform) prevents duplicates at the database level
