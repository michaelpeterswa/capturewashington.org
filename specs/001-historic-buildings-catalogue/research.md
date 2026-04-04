# Research: WA Historic Buildings Catalogue

**Feature**: 001-historic-buildings-catalogue
**Date**: 2026-04-03

## R1: Infinite Scroll with Next.js App Router + RSC

**Decision**: Use Intersection Observer API in a client component
wrapping server-fetched entry batches. Cursor-based pagination via
`capturedAt` timestamp + entry ID for stable ordering.

**Rationale**: Intersection Observer is native (zero dependency),
performant, and avoids scroll event listeners. Cursor pagination
avoids offset drift when new entries are published. Server Actions
or API route for fetching next page keeps data fetching on the server.

**Alternatives considered**:

- `react-infinite-scroll-component` — adds dependency, limited RSC
  compatibility
- Offset-based pagination — breaks when entries are added/archived
  between pages

## R2: Full-Text Search on Postgres (Neon)

**Decision**: Use Postgres native `tsvector` / `tsquery` full-text
search with a GIN index on a generated `search_vector` column
combining title and body. Geographic proximity search via the
`earthdistance` + `cube` Postgres extensions (available on Neon).

**Rationale**: Native Postgres FTS avoids external search
infrastructure (Algolia, Meilisearch) and keeps the stack simple.
At <10K entries, GIN index performance is more than adequate.
`earthdistance` provides lat/lng distance calculations without
PostGIS, which is not available on Neon's free tier.

**Alternatives considered**:

- Algolia/Meilisearch — external dependency, cost, overkill for scale
- PostGIS — not available on Neon free tier
- Client-side filtering — doesn't scale, poor UX for combined filters

## R3: Media Upload with Presigned URLs to Cloudflare R2

**Decision**: Admin UI calls `POST /api/upload/presign` with filename,
content type, and file size. Server validates constraints (50 MB max,
accepted MIME types, 20-file cap) and returns a presigned PUT URL
(15-minute expiry). Browser uploads directly to R2. On success,
client calls the entry media API to persist the `r2Key`.

**Rationale**: Direct upload avoids proxying large files through the
512 MB Fly.io container. Presign endpoint enforces all constraints
server-side before the upload begins. R2's S3-compatible API works
with `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.

**Alternatives considered**:

- Server-side proxy upload — risks OOM on 512 MB container with
  concurrent uploads
- Cloudflare Workers upload handler — adds infrastructure complexity

## R4: Role-Based Access Control with NextAuth.js

**Decision**: Extend NextAuth.js session with a `role` field
(super-admin | admin) looked up from a `User` table in Postgres.
First user in the system is auto-promoted to super-admin via
`INITIAL_ADMIN_EMAIL` env var. Subsequent admins are invited by
super-admin through the user management UI.

**Rationale**: NextAuth.js already handles Google OAuth. Adding a
`User` model with a `role` column keeps auth logic in one place.
Session callback injects role into the JWT, making it available on
both server and client without extra DB queries per request.

**Alternatives considered**:

- Environment variable allowlist — doesn't support role tiers or
  dynamic user management
- Separate auth service — overkill for 1–5 admins

## R5: Entry Lifecycle (Draft → Published → Archived) + Soft Delete

**Decision**: Add `status` enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`) and
`deletedAt` nullable timestamp to the `Entry` model. Public queries
filter `WHERE status = 'PUBLISHED' AND deletedAt IS NULL`. Admin
dashboard shows all statuses with filter tabs. Super-admins see
soft-deleted entries and can restore them.

**Rationale**: Enum status is explicit and queryable. `deletedAt`
timestamp supports soft delete orthogonally to the lifecycle status,
allowing archived entries to be distinguished from deleted ones.
Prisma middleware or a global `$extends` filter can enforce the
public visibility rule automatically.

**Alternatives considered**:

- Boolean `isPublished` — doesn't support three states
- Separate `deleted` boolean — timestamp is more informative for
  auditing

## R6: Map Clustering with Leaflet

**Decision**: Use `leaflet.markercluster` plugin for automatic pin
clustering at lower zoom levels. Dynamically import the map component
with `next/dynamic` and `{ ssr: false }` since Leaflet requires
`window`.

**Rationale**: `leaflet.markercluster` is the standard solution,
well-maintained, and works with react-leaflet. Dynamic import
prevents SSR errors and keeps the Leaflet JS out of the initial
server-rendered bundle.

**Alternatives considered**:

- Supercluster (Mapbox) — heavier dependency, designed for Mapbox GL
- No clustering — unusable when entries are geographically dense

## R7: Markdown Rendering Pipeline

**Decision**: Server-side pipeline: `remark-parse` → `remark-rehype`
→ `rehype-sanitize` (default schema) → `rehype-stringify`. Run in
Server Components only; output cached HTML string. No client-side
rendering.

**Rationale**: Server-side rendering eliminates client JS bundle cost
for markdown processing. `rehype-sanitize` with default schema strips
XSS vectors while preserving standard HTML elements. Caching the
rendered output avoids re-processing on every request.

**Alternatives considered**:

- MDX — over-engineered for user-authored markdown stored in DB
- Client-side `react-markdown` — adds to JS bundle, unnecessary since
  content is not interactive

## R8: Slug Generation

**Decision**: Generate slug from title at creation time using
`title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
plus a 7-character cuid suffix for uniqueness. Store as immutable
field — title edits do not update the slug.

**Rationale**: Human-readable slugs are good for SEO and
shareability. Appending a short cuid avoids collisions without
requiring a uniqueness retry loop. Immutability preserves bookmarks
and external links.

**Alternatives considered**:

- UUID-only slugs — not human-readable
- Title-only slugs with retry — race condition risk under concurrent
  creation

## R9: Design Token System

**Decision**: Define CSS custom properties in `src/styles/tokens.css`
imported in the root layout. Tokens cover color palette, spacing
scale (4px base), typography scale, border radii, shadows, and
breakpoints. Components consume tokens via `var(--token-name)`.

**Rationale**: CSS custom properties are native, zero-runtime, and
work with both Server and Client Components. No CSS-in-JS library
needed, keeping the JS bundle lean. Constitution requires design
tokens; CSS variables are the simplest compliant approach.

**Alternatives considered**:

- Tailwind CSS — utility-first approach conflicts with explicit token
  mandate; adds build complexity
- styled-components / Emotion — runtime CSS-in-JS hurts performance
  and is incompatible with RSC

## R10: Testing Strategy with Vitest

**Decision**: Vitest for unit and integration tests. React Testing
Library for component tests. Test database provisioned via Prisma
`db push` to a separate Neon branch or local Docker Postgres for CI.
Co-located unit tests (`*.test.ts`); integration tests in `tests/`.

**Rationale**: Vitest is fast, ESM-native, and compatible with the
Next.js ecosystem. Co-located tests satisfy the constitution's
requirement. Separate integration test directory keeps API route tests
organized. Neon branching provides isolated test databases without
local Postgres setup.

**Alternatives considered**:

- Jest — slower, requires more configuration for ESM/TypeScript
- Playwright for E2E — useful later but not needed for initial TDD
  workflow
