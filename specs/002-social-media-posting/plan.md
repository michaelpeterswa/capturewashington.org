# Implementation Plan: Social Media Cross-Posting

**Branch**: `002-social-media-posting` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-social-media-posting/spec.md`

## Summary

Automatically cross-post entries to Bluesky and Instagram when published. Uses AT Protocol HTTP API for Bluesky (blob upload + record creation) and Instagram Graph API container-based publishing. Captions auto-generated from entry title, location, and tags. Fire-and-forget async execution with database-tracked status and admin-visible retry.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16 (App Router), Prisma 6, existing R2/CDN stack
**Storage**: Neon Postgres (new SocialPost table), Cloudflare R2 (existing images)
**Testing**: Vitest + Testing Library (co-located)
**Target Platform**: Fly.io (Docker, Node 20 Alpine)
**Project Type**: Web service (Next.js App Router)
**Performance Goals**: Cross-posting completes within 60s of publish; publish action returns in <500ms (not blocked)
**Constraints**: No new infrastructure (no job queue); fire-and-forget async; JPEG conversion for Instagram
**Scale/Scope**: Low volume (~5 posts/week); single admin user

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle           | Status | Notes                                                                                                                                  |
| ------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| I. Code Quality     | PASS   | Single-responsibility modules (bluesky.ts, instagram.ts, social.ts). No `any` types.                                                   |
| II. Test-First      | PASS   | Tests for caption generation, duplicate guard, social posting service (mocked API calls).                                              |
| III. UX Consistency | PASS   | Status indicators on edit page use existing Badge component. Retry button uses existing Button.                                        |
| IV. Performance     | PASS   | Cross-posting is async, does not block publish. No new client-side JS bundle impact.                                                   |
| Tech Stack          | PASS   | No new technologies. Uses fetch (built-in), Prisma, existing R2 CDN. Sharp for image processing (already in node_modules via Next.js). |
| Workflow            | PASS   | Feature branch, conventional commits, CI gates.                                                                                        |

**Post-Phase 1 re-check**: PASS — no violations introduced by design decisions.

## Project Structure

### Documentation (this feature)

```text
specs/002-social-media-posting/
├── plan.md              # This file
├── research.md          # Phase 0: API research
├── data-model.md        # Phase 1: SocialPost model
├── quickstart.md        # Phase 1: Setup guide
├── contracts/
│   └── api-social.md    # Phase 1: Retry endpoint + status extension
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── social/
│   │   ├── bluesky.ts       # Bluesky API client (auth, upload, post)
│   │   ├── instagram.ts     # Instagram API client (container, publish, token refresh)
│   │   ├── caption.ts       # Caption generation + hashtag formatting
│   │   └── cross-post.ts    # Orchestrator (trigger, duplicate guard, async dispatch)
│   └── image.ts             # Image fetch, resize, JPEG conversion
├── app/api/entries/[id]/
│   ├── route.ts             # Modified: trigger cross-post on PUBLISHED
│   └── social/
│       └── retry/
│           └── route.ts     # New: retry endpoint
└── app/admin/entry/[id]/edit/
    └── page.tsx             # Modified: show social post status + retry button

prisma/
└── schema.prisma            # Modified: SocialPost model, SocialPlatform/SocialPostStatus enums

tests/
└── (co-located with source as *.test.ts)
```

**Structure Decision**: New social media logic goes in `src/lib/social/` as a self-contained module. One file per platform, one orchestrator, one shared caption utility. Image processing in `src/lib/image.ts`. API route addition under existing `entries/[id]/` path. No new top-level directories.

## Complexity Tracking

No constitution violations requiring justification.
