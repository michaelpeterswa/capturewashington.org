# Tasks: WA Historic Buildings Catalogue

**Input**: Design documents from `/specs/001-historic-buildings-catalogue/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Constitution mandates Test-First (TDD) as NON-NEGOTIABLE. All phases include test tasks written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: Next.js App Router at `src/app/`, components at `src/components/`, libraries at `src/lib/`
- **Tests**: Co-located unit tests (`*.test.ts`/`*.test.tsx`), integration tests in `tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and base configuration

- [x] T001 Initialize Next.js project with Bun, App Router, and TypeScript strict mode in project root
- [x] T002 Configure Vitest + React Testing Library in `vitest.config.ts` and `tests/setup.ts`
- [x] T003 [P] Configure ESLint + Prettier with zero-warning policy in `eslint.config.mjs` and `.prettierrc`
- [x] T004 [P] Create design token CSS variables (colors, spacing, typography, shadows, breakpoints) in `src/styles/tokens.css`
- [x] T005 [P] Create environment variables template in `.env.example` with all required vars (DATABASE*URL, NEXTAUTH*_, GOOGLE\__, R2\_\*, INITIAL_ADMIN_EMAIL)
- [x] T006 [P] Create shared TypeScript types (Entry, Media, Tag, User, enums) in `src/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] Unit test for Prisma client singleton in `src/lib/db.test.ts`
- [x] T008 [P] Unit test for R2 presign helper in `src/lib/r2.test.ts`
- [x] T009 [P] Unit test for markdown rendering pipeline in `src/lib/markdown.test.ts`
- [x] T010 [P] Unit test for slug generation in `src/lib/slug.test.ts`
- [x] T011 [P] Unit test for input validation utilities in `src/lib/validation.test.ts`
- [x] T012 [P] Unit test for auth helpers in `src/lib/auth.test.ts`
- [ ] T013 [P] Integration test for auth flow in `tests/integration/auth.test.ts`

### Implementation for Foundational

- [x] T014 Create Prisma schema with Entry, Media, Tag, User models and enums (EntryStatus, MediaType, UserRole) in `prisma/schema.prisma`
- [x] T015 [P] Implement Prisma client singleton in `src/lib/db.ts`
- [x] T016 [P] Implement R2 client and presign helper in `src/lib/r2.ts`
- [x] T017 [P] Implement markdown rendering pipeline (remark-parse → remark-rehype → rehype-sanitize → rehype-stringify) in `src/lib/markdown.ts`
- [x] T018 [P] Implement slug generation (title → kebab-case + cuid suffix) in `src/lib/slug.ts`
- [x] T019 [P] Implement input validation utilities (upload constraints, entry fields) in `src/lib/validation.ts`
- [x] T020 Implement Auth.js v5 config with Google OAuth, role-based session callback, and initial admin bootstrap in `src/lib/auth.ts`
- [x] T021 Set up Auth.js API route handler in `src/app/api/auth/[...nextauth]/route.ts`
- [x] T022 Create admin layout with auth guard (redirect non-admins) in `src/app/admin/layout.tsx`
- [x] T023 Create root layout importing `tokens.css` in `src/app/layout.tsx`
- [x] T024 [P] Create shared UI primitives: Skeleton in `src/components/ui/Skeleton.tsx`, EmptyState in `src/components/ui/EmptyState.tsx`, ErrorState in `src/components/ui/ErrorState.tsx`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Browse Historic Building Timeline (Priority: P1) 🎯 MVP

**Goal**: Visitors see a chronologically ordered timeline of entries on the homepage with infinite scroll

**Independent Test**: Load homepage, verify entries appear in reverse chronological order. Scroll to trigger infinite scroll loading. Click an entry card to navigate to detail page.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T025 [P] [US1] Unit test for EntryCard component in `src/components/EntryCard.test.tsx`
- [x] T026 [P] [US1] Unit test for InfiniteTimeline component in `src/components/InfiniteTimeline.test.tsx`
- [ ] T027 [P] [US1] Integration test for GET /api/entries (cursor pagination, published-only filter) in `tests/integration/entries.test.ts`

### Implementation for User Story 1

- [x] T028 [P] [US1] Create EntryCard component (title, thumbnail, location, date, placeholder image fallback) in `src/components/EntryCard.tsx`
- [x] T029 [US1] Implement GET /api/entries route with cursor-based pagination, published-only filter, 20-per-page default in `src/app/api/entries/route.ts`
- [x] T030 [US1] Create InfiniteTimeline client component with Intersection Observer for auto-loading in `src/components/InfiniteTimeline.tsx`
- [x] T031 [US1] Build timeline homepage with server-rendered initial batch + InfiniteTimeline in `src/app/(public)/page.tsx`

**Checkpoint**: Homepage displays entries with infinite scroll. MVP is functional.

---

## Phase 4: User Story 2 — View Individual Building Entry (Priority: P1)

**Goal**: Visitors see full entry detail: rendered markdown, media gallery, embedded map, tags

**Independent Test**: Navigate to `/entry/[slug]`. Verify markdown renders as HTML, photos/videos display in order, map shows pin, tags link to filtered views.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T032 [P] [US2] Unit test for MarkdownRenderer component in `src/components/MarkdownRenderer.test.tsx`
- [x] T033 [P] [US2] Unit test for MediaGallery component in `src/components/MediaGallery.test.tsx`
- [ ] T034 [P] [US2] Integration test for GET /api/entries/[id] in `tests/integration/entries.test.ts`

### Implementation for User Story 2

- [x] T035 [P] [US2] Create MarkdownRenderer server component in `src/components/MarkdownRenderer.tsx`
- [x] T036 [P] [US2] Create MediaGallery component (photos + inline video player, sort order) in `src/components/MediaGallery.tsx`
- [x] T037 [US2] Implement GET /api/entries/[id] route (includes rendered markdown HTML, media, tags) in `src/app/api/entries/[id]/route.ts`
- [x] T038 [US2] Create small embedded map component for entry detail (single pin, no clustering needed) in `src/components/EntryMap.tsx` with dynamic import wrapper
- [x] T039 [US2] Build entry detail page with markdown body, media gallery, embedded map, tags in `src/app/(public)/entry/[slug]/page.tsx`

**Checkpoint**: Timeline → Entry detail flow is complete. Both P1 stories functional.

---

## Phase 5: User Story 3 — Explore Buildings on Interactive Map (Priority: P2)

**Goal**: Full map view with pins for all entries, popup previews, marker clustering

**Independent Test**: Open `/map`. Verify all published entries appear as pins. Click a pin, verify popup with title/thumbnail/link. Click link, verify navigation to entry page.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T040 [P] [US3] Unit test for MapPin component in `src/components/MapPin.test.tsx`
- [x] T041 [P] [US3] Unit test for full map page rendering in `src/components/EntryMap.test.tsx`

### Implementation for User Story 3

- [x] T042 [P] [US3] Create MapPin component (marker icon, popup with title/thumbnail/link) in `src/components/MapPin.tsx`
- [x] T043 [US3] Extend EntryMap component with marker clustering (leaflet.markercluster) and multi-pin support in `src/components/EntryMap.tsx`
- [x] T044 [US3] Build full map page fetching all published entries and rendering clustered map in `src/app/(public)/map/page.tsx`

**Checkpoint**: All three public discovery surfaces work (timeline, entry detail, map).

---

## Phase 6: User Story 4 — Admin Creates a New Entry (Priority: P2)

**Goal**: Admins can create entries with title, markdown body, location picker, date, tags, and media uploads in Draft status

**Independent Test**: Log in as admin, create an entry with all fields + photos, save. Verify entry appears in admin dashboard as Draft. Publish it. Verify it appears on public timeline.

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T045 [P] [US4] Unit test for LocationPicker component in `src/components/LocationPicker.test.tsx`
- [x] T046 [P] [US4] Unit test for MediaUploader component in `src/components/MediaUploader.test.tsx`
- [x] T047 [P] [US4] Unit test for StatusBadge component in `src/components/StatusBadge.test.tsx`
- [ ] T048 [P] [US4] Integration test for POST /api/entries in `tests/integration/entries.test.ts`
- [ ] T049 [P] [US4] Integration test for POST /api/upload/presign in `tests/integration/upload.test.ts`
- [ ] T050 [P] [US4] Integration test for POST /api/entries/[id]/media in `tests/integration/entries.test.ts`

### Implementation for User Story 4

- [x] T051 [P] [US4] Create LocationPicker client component (map click → lat/lng auto-fill) in `src/components/LocationPicker.tsx`
- [x] T052 [P] [US4] Create StatusBadge component (Draft/Published/Archived visual indicator) in `src/components/StatusBadge.tsx`
- [x] T053 [US4] Create MediaUploader client component (validate → presign → direct R2 upload → confirm) in `src/components/MediaUploader.tsx`
- [x] T054 [US4] Implement POST /api/entries route (create in DRAFT status, auto-generate slug) in `src/app/api/entries/route.ts`
- [x] T055 [US4] Implement POST /api/upload/presign route (validate size/type/count, return presigned URL) in `src/app/api/upload/presign/route.ts`
- [x] T056 [US4] Implement POST /api/entries/[id]/media route (persist r2Key after upload) in `src/app/api/entries/[id]/media/route.ts`
- [x] T057 [US4] Implement GET /api/tags route (list all tags for tag picker) in `src/app/api/tags/route.ts`
- [x] T058 [US4] Build new entry form page with all fields + media uploader + location picker in `src/app/admin/new/page.tsx`
- [x] T059 [US4] Build admin dashboard page with entry list, status filter tabs, and status badge in `src/app/admin/page.tsx`

**Checkpoint**: Full admin create workflow operational. Entries can be created, published, and viewed publicly.

---

## Phase 7: User Story 5 — Admin Edits an Existing Entry (Priority: P2)

**Goal**: Admins can edit any entry field, manage media (add/remove/reorder), and transition entry status

**Independent Test**: Edit an entry's title and add a photo. Verify public page reflects changes. Change status to Archived. Verify entry disappears from public views.

### Tests for User Story 5 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T060 [P] [US5] Integration test for PUT /api/entries/[id] (partial update + status transitions) in `tests/integration/entries.test.ts`
- [ ] T061 [P] [US5] Integration test for DELETE /api/entries/[id] (soft delete + restore) in `tests/integration/entries.test.ts`
- [ ] T062 [P] [US5] Integration test for media management (reorder, delete) in `tests/integration/entries.test.ts`

### Implementation for User Story 5

- [x] T063 [US5] Implement PUT /api/entries/[id] route (partial update, status transition, slug immutable) in `src/app/api/entries/[id]/route.ts`
- [x] T064 [US5] Implement DELETE /api/entries/[id] route (soft delete via deletedAt) in `src/app/api/entries/[id]/route.ts`
- [x] T065 [US5] Implement PUT /api/entries/[id]/media route (reorder) and DELETE (remove from R2 + DB) in `src/app/api/entries/[id]/media/route.ts`
- [x] T066 [US5] Build edit entry form page (pre-populated, media management, status controls) in `src/app/admin/entry/[id]/edit/page.tsx`

**Checkpoint**: Full admin CRUD lifecycle complete. Entries can be created, edited, status-transitioned, soft-deleted, and restored.

---

## Phase 8: User Story 6 — Search and Filter Entries (Priority: P3)

**Goal**: Visitors can search by keyword, filter by tag/date/location radius with combined filters

**Independent Test**: Search "City Hall" → only matching entries. Filter by tag → correct subset. Set date range → entries outside range excluded. Set location radius → only nearby entries.

### Tests for User Story 6 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T067 [P] [US6] Unit test for SearchBar component in `src/components/SearchBar.test.tsx`
- [ ] T068 [P] [US6] Unit test for search utility functions in `src/lib/search.test.ts`
- [ ] T069 [P] [US6] Integration test for GET /api/search in `tests/integration/search.test.ts`

### Implementation for User Story 6

- [ ] T070 [US6] Add full-text search vector column and GIN index, enable earthdistance + cube extensions via Prisma migration in `prisma/schema.prisma` and raw SQL migration
- [x] T071 [US6] Implement search utility with tsvector FTS, tag filter, date range, and earthdistance geo filter in `src/lib/search.ts`
- [x] T072 [US6] Implement GET /api/search route with combined AND filters, relevance ranking, cursor pagination in `src/app/api/search/route.ts`
- [x] T073 [US6] Create SearchBar client component (keyword input, tag selector, date range picker, location radius picker) in `src/components/SearchBar.tsx`
- [x] T074 [US6] Build search results page with SearchBar + timeline/map view toggle in `src/app/(public)/search/page.tsx`

**Checkpoint**: All public features complete (timeline, entry detail, map, search).

---

## Phase 9: User Story 7 — Admin Manages Users and Roles (Priority: P3)

**Goal**: Super-admins can invite admins, assign roles, and revoke access

**Independent Test**: As super-admin, add a new admin by email. Verify they can sign in. Revoke their access. Verify they're blocked. Verify regular admins cannot access user management.

### Tests for User Story 7 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T075 [P] [US7] Integration test for GET/POST/PUT/DELETE /api/users (super-admin only, self-protection) in `tests/integration/auth.test.ts`

### Implementation for User Story 7

- [x] T076 [US7] Implement GET /api/users and POST /api/users routes (list admins, invite by email, super-admin only) in `src/app/api/users/route.ts`
- [x] T077 [US7] Implement PUT /api/users/[id] and DELETE /api/users/[id] routes (role change, revoke, self-protection) in `src/app/api/users/[id]/route.ts`
- [x] T078 [US7] Build user management page (user list, invite form, role controls, revoke button) in `src/app/admin/users/page.tsx`

**Checkpoint**: Full admin system with role-based access control.

---

## Phase 10: User Story 8 — Media Playback and CDN Delivery (Priority: P3)

**Goal**: Photos served via CDN in modern formats with long cache headers. Videos play inline with standard controls.

**Independent Test**: Load entry with large photo. Verify CDN URL, WebP/AVIF format, cache headers. Play a video inline. Verify returning visitor loads from browser cache.

### Tests for User Story 8 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T079 [P] [US8] Unit test for responsive image component and video player in `src/components/MediaGallery.test.tsx`

### Implementation for User Story 8

- [x] T080 [US8] Add responsive image rendering with `srcset` and WebP/AVIF format via R2 public URL in `src/components/MediaGallery.tsx`
- [x] T081 [US8] Add inline video player with standard controls (play/pause, seek, volume, fullscreen) to MediaGallery in `src/components/MediaGallery.tsx`
- [ ] T082 [US8] Configure R2 bucket Cache-Control headers (`public, max-age=31536000, immutable`) via Cloudflare dashboard (document steps in `docs/r2-cdn-setup.md`)

**Checkpoint**: All user stories complete. Full feature set operational.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T083 [P] Create custom 404 page with navigation back to timeline in `src/app/not-found.tsx`
- [x] T084 [P] Add loading skeletons to all public pages in `src/app/(public)/loading.tsx`, `src/app/(public)/entry/[slug]/loading.tsx`, `src/app/(public)/map/loading.tsx`
- [x] T085 [P] Create Dockerfile with multi-stage Alpine build and `output: "standalone"` in `Dockerfile` and `next.config.ts`
- [x] T086 [P] Create Fly.io config with `primary_region = "sea"` in `fly.toml`
- [ ] T087 Run Lighthouse CI on timeline, entry, and map pages — fix any Core Web Vitals regressions
- [ ] T088 Validate WCAG 2.1 AA compliance (focus indicators, keyboard nav, alt text, semantic HTML) across all public pages
- [ ] T089 Run quickstart.md verification checklist end-to-end
- [ ] T090 Production deployment to Fly.io and smoke test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–10)**: All depend on Foundational phase completion
  - US1 (Phase 3) and US2 (Phase 4): Can proceed in parallel (independent pages)
  - US3 (Phase 5): Can start after Phase 2, but benefits from EntryMap work in US2
  - US4 (Phase 6): Can start after Phase 2, independent of public pages
  - US5 (Phase 7): Depends on US4 (edit requires create flow)
  - US6 (Phase 8): Can start after Phase 2, independent of admin
  - US7 (Phase 9): Can start after Phase 2, independent of content stories
  - US8 (Phase 10): Depends on US2 (extends MediaGallery component)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Timeline)**: Independent after Foundational
- **US2 (Entry Detail)**: Independent after Foundational
- **US3 (Map)**: Benefits from US2's EntryMap component but independently testable
- **US4 (Admin Create)**: Independent after Foundational
- **US5 (Admin Edit)**: Requires US4 (create flow must exist to have entries to edit)
- **US6 (Search)**: Independent after Foundational
- **US7 (User Management)**: Independent after Foundational
- **US8 (CDN Media)**: Extends US2's MediaGallery component

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD — Constitution Principle II)
- Models/utilities before services
- Services before API routes
- API routes before pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003–T006)
- All Foundational tests marked [P] can run in parallel (T007–T013)
- All Foundational implementations marked [P] can run in parallel (T015–T019, T024)
- US1 and US2 can run in parallel after Foundational
- US4, US6, and US7 can run in parallel after Foundational
- Within each story, all tests marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for US1 together (TDD - write first):
Task: "Unit test for EntryCard in src/components/EntryCard.test.tsx"
Task: "Unit test for InfiniteTimeline in src/components/InfiniteTimeline.test.tsx"
Task: "Integration test for GET /api/entries in tests/integration/entries.test.ts"

# After tests fail, launch parallel implementations:
Task: "Create EntryCard component in src/components/EntryCard.tsx"
# Then sequential:
Task: "Implement GET /api/entries route in src/app/api/entries/route.ts"
Task: "Create InfiniteTimeline in src/components/InfiniteTimeline.tsx"
Task: "Build timeline homepage in src/app/(public)/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Timeline)
4. **STOP and VALIDATE**: Homepage displays entries with infinite scroll
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Timeline) → Test independently → Deploy (MVP!)
3. Add US2 (Entry Detail) → Test independently → Deploy (full read experience)
4. Add US3 (Map) → Test independently → Deploy (all public discovery)
5. Add US4 (Admin Create) → Test independently → Deploy (admin can add content)
6. Add US5 (Admin Edit) → Test independently → Deploy (full admin CRUD)
7. Add US6 (Search) → Test independently → Deploy (discoverable content)
8. Add US7 (User Management) → Test independently → Deploy (multi-admin)
9. Add US8 (CDN Media) → Test independently → Deploy (optimized delivery)
10. Polish → Production deploy

### Parallel Team Strategy

With multiple developers after Foundational:

- Developer A: US1 (Timeline) → US3 (Map)
- Developer B: US2 (Entry Detail) → US8 (CDN Media)
- Developer C: US4 (Admin Create) → US5 (Admin Edit)
- Developer D: US6 (Search) + US7 (User Management)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD is NON-NEGOTIABLE (Constitution Principle II): write tests first, verify they fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Bun is the package manager — all commands use `bun` / `bunx`
