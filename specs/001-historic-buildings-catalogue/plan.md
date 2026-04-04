# Implementation Plan: WA Historic Buildings Catalogue

**Branch**: `001-historic-buildings-catalogue` | **Date**: 2026-04-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-historic-buildings-catalogue/spec.md`

## Summary

Build capturewashington.org — a public-facing photo/video catalogue of historic Washington state buildings. The app provides a timeline homepage with infinite scroll, individual entry pages with rendered markdown and media galleries, a full interactive map, role-based admin for content management (Draft → Published → Archived lifecycle), direct-to-R2 media uploads, and full-text search with tag/date/location filtering. Deployed as a single Docker container on Fly.io.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**: Next.js 14+ (App Router), Prisma, NextAuth.js, Leaflet + react-leaflet, remark + rehype, @aws-sdk/client-s3
**Storage**: Neon Postgres (serverless) + Cloudflare R2 (S3-compatible object storage)
**Testing**: Vitest + React Testing Library (co-located `*.test.ts` / `*.test.tsx`)
**Target Platform**: Web — Fly.io Docker container (Node 20, Alpine Linux)
**Project Type**: Full-stack web application
**Performance Goals**: Core Web Vitals "Good" (LCP < 2.5s, INP < 200ms, CLS < 0.1); JS bundle < 200 KB gzipped
**Constraints**: Single container (512 MB RAM, shared CPU); no local Postgres; presigned-URL uploads only; Bun as package manager
**Scale/Scope**: <10,000 entries, 1–5 concurrent admins, ~12 pages/views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality — ✅ PASS

- TypeScript strict mode: enforced via `tsconfig.json` `strict: true`
- ESLint + Prettier: configured in project root, CI gate
- Single responsibility: Next.js App Router file conventions enforce route-per-file; shared logic in `src/lib/`
- No premature abstraction: feature code stays in route files until 3+ usages

### II. Test-First (TDD) — ✅ PASS

- Vitest + React Testing Library selected (constitution-mandated stack)
- Co-located test files: `*.test.ts` / `*.test.tsx` next to source
- TDD workflow: tests written first → fail → implement → pass → refactor
- Integration tests: API routes tested via Vitest with Prisma test database
- PR gate: CI runs full test suite; no merge without green

### III. UX Consistency — ✅ PASS

- Design tokens: CSS custom properties for colors, spacing, typography, shadows
- WCAG 2.1 AA: focus indicators, keyboard navigation, semantic HTML, alt text
- Responsive: mobile (≥320px), tablet (≥768px), desktop (≥1024px)
- Consistent states: skeleton loaders, dedicated empty/error state components
- Unified visual language: shared card component for timeline, map popups, search results

### IV. Performance — ✅ PASS

- RSC default: all public pages are Server Components; `"use client"` only for map, media uploader, infinite scroll, search input
- JS bundle: target <200 KB gzipped; Leaflet dynamically imported (no SSR)
- Images: WebP/AVIF via Cloudflare CDN; responsive `srcset`
- Core Web Vitals: Lighthouse CI in PR pipeline for regression detection
- Third-party script policy: each addition measured against 20 KB threshold

**Gate result: ALL PASS — proceed to Phase 0**

## Project Structure

### Documentation (this feature)

```text
specs/001-historic-buildings-catalogue/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── api-entries.md
│   ├── api-upload.md
│   ├── api-auth.md
│   ├── api-search.md
│   └── api-users.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma

public/
├── placeholder.svg

src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Timeline homepage
│   │   ├── map/
│   │   │   └── page.tsx                # Full map view
│   │   ├── entry/[slug]/
│   │   │   └── page.tsx                # Individual entry
│   │   └── search/
│   │       └── page.tsx                # Search results
│   ├── admin/
│   │   ├── layout.tsx                  # Auth guard
│   │   ├── page.tsx                    # Dashboard (entry list)
│   │   ├── new/
│   │   │   └── page.tsx                # New entry form
│   │   ├── entry/[id]/edit/
│   │   │   └── page.tsx                # Edit entry form
│   │   └── users/
│   │       └── page.tsx                # User management (super-admin)
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts                # NextAuth handler
│   │   ├── entries/
│   │   │   └── route.ts                # GET list, POST create
│   │   ├── entries/[id]/
│   │   │   └── route.ts                # GET, PUT, DELETE, PATCH status
│   │   ├── entries/[id]/media/
│   │   │   └── route.ts                # GET, POST, PUT order, DELETE
│   │   ├── upload/
│   │   │   └── presign/
│   │   │       └── route.ts            # POST presigned URL
│   │   ├── search/
│   │   │   └── route.ts                # GET search with filters
│   │   ├── tags/
│   │   │   └── route.ts                # GET all tags
│   │   └── users/
│   │       └── route.ts                # GET, POST, PUT, DELETE (super-admin)
│   └── layout.tsx                      # Root layout
├── components/
│   ├── EntryCard.tsx                   # Shared card (timeline, search)
│   ├── EntryCard.test.tsx
│   ├── EntryMap.tsx                    # react-leaflet wrapper (dynamic)
│   ├── EntryMap.test.tsx
│   ├── MediaGallery.tsx                # Photo/video gallery
│   ├── MediaGallery.test.tsx
│   ├── MediaUploader.tsx               # Presign + direct upload
│   ├── MediaUploader.test.tsx
│   ├── MarkdownRenderer.tsx            # Server-side markdown
│   ├── MarkdownRenderer.test.tsx
│   ├── MapPin.tsx                      # Map marker component
│   ├── InfiniteTimeline.tsx            # Infinite scroll container
│   ├── InfiniteTimeline.test.tsx
│   ├── SearchBar.tsx                   # Search + filter controls
│   ├── SearchBar.test.tsx
│   ├── LocationPicker.tsx              # Admin map picker
│   ├── LocationPicker.test.tsx
│   ├── StatusBadge.tsx                 # Draft/Published/Archived badge
│   └── ui/                             # Design token primitives
│       ├── Skeleton.tsx
│       ├── EmptyState.tsx
│       └── ErrorState.tsx
├── lib/
│   ├── db.ts                           # Prisma client singleton
│   ├── db.test.ts
│   ├── r2.ts                           # S3-compatible R2 client
│   ├── r2.test.ts
│   ├── auth.ts                         # NextAuth config + helpers
│   ├── auth.test.ts
│   ├── markdown.ts                     # remark/rehype pipeline
│   ├── markdown.test.ts
│   ├── slug.ts                         # Slug generation (title + cuid)
│   ├── slug.test.ts
│   ├── search.ts                       # Full-text + geo search queries
│   ├── search.test.ts
│   └── validation.ts                   # Upload constraints, input checks
├── styles/
│   └── tokens.css                      # CSS custom properties
└── types/
    └── index.ts                        # Shared TypeScript types

tests/
├── integration/
│   ├── entries.test.ts                 # API route integration tests
│   ├── upload.test.ts
│   ├── search.test.ts
│   └── auth.test.ts
└── setup.ts                            # Test database setup/teardown
```

**Structure Decision**: Single Next.js project (no monorepo). App Router conventions naturally separate public routes, admin routes, and API routes. Shared components and library code live in `src/components/` and `src/lib/` respectively. Integration tests in a top-level `tests/` directory; unit tests co-located with source.

## Complexity Tracking

> No Constitution Check violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    | —          | —                                   |
