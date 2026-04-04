<!--
  Sync Impact Report
  ==================
  Version change: N/A → 1.0.0 (initial ratification)
  Modified principles: N/A (initial)
  Added sections:
    - Core Principles (4): Code Quality, Test-First, UX Consistency,
      Performance
    - Technology Stack Constraints
    - Development Workflow & Review Process
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed
      (Constitution Check is a dynamic placeholder filled per feature)
    - .specify/templates/spec-template.md ✅ no changes needed
      (requirements-driven, aligns with principle structure)
    - .specify/templates/tasks-template.md ✅ no changes needed
      (TDD ordering already enforced in task phases)
  Follow-up TODOs: none
-->

# capturewashington.org Constitution

## Core Principles

### I. Code Quality

All code MUST be clear, consistent, and maintainable. Specific rules:

- Every module, component, and utility MUST have a single, well-defined
  responsibility.
- TypeScript strict mode MUST be enabled. No `any` types except at
  validated system boundaries (external API responses, third-party
  library gaps). Each `any` usage MUST include an inline comment
  justifying it.
- Shared logic MUST be extracted only when used in three or more
  locations. Premature abstraction is a violation.
- Dead code, unused imports, and commented-out blocks MUST be removed
  before merge. Git history preserves prior states.
- Linting (ESLint) and formatting (Prettier) MUST pass with zero
  warnings. CI MUST enforce this gate.

### II. Test-First (NON-NEGOTIABLE)

All feature work MUST follow Test-Driven Development:

- **Red**: Tests MUST be written and reviewed before any implementation
  code exists. Tests MUST fail when first run.
- **Green**: Implementation MUST target passing the written tests and
  nothing more.
- **Refactor**: Once green, code MUST be cleaned up without changing
  behavior. Tests MUST remain green.
- Unit tests MUST cover all exported functions and React component
  behaviors.
- Integration tests MUST cover API routes, database operations, and
  cross-component workflows.
- Test files MUST be co-located with source files using the
  `*.test.ts` / `*.test.tsx` naming convention.
- No PR MUST be merged without passing all existing tests and including
  new tests for the changed behavior.

### III. UX Consistency

The public-facing experience MUST feel cohesive across every page and
interaction:

- A shared design token system (colors, spacing, typography, shadows)
  MUST be defined and consumed via CSS variables or a theme provider.
  Hard-coded style values in components are a violation.
- All interactive elements MUST have visible focus indicators and
  keyboard navigation support (WCAG 2.1 AA minimum).
- Page layouts MUST be responsive across mobile (≥320px), tablet
  (≥768px), and desktop (≥1024px) breakpoints.
- Loading states MUST use consistent skeleton or spinner patterns.
  Empty states and error states MUST have dedicated UI — no raw error
  strings shown to users.
- Map markers, timeline cards, and entry pages MUST share a unified
  visual language (consistent card structure, image aspect ratios,
  typography scale).

### IV. Performance

Core Web Vitals MUST meet or exceed Google's "Good" thresholds on
representative pages:

- **LCP** (Largest Contentful Paint): MUST be under 2.5 seconds on
  a 4G connection.
- **INP** (Interaction to Next Paint): MUST be under 200 milliseconds.
- **CLS** (Cumulative Layout Shift): MUST be under 0.1.
- JavaScript bundle size for the initial page load MUST NOT exceed
  200 KB (gzipped). Images MUST use modern formats (WebP/AVIF) with
  responsive `srcset` attributes.
- Server-rendered pages (RSC) MUST be the default. Client components
  MUST only be used when interactivity requires it, and each
  `"use client"` directive MUST be justified.
- No third-party script MUST be added without measuring its impact
  on LCP and total bundle size. Any script adding >20 KB MUST be
  loaded asynchronously or deferred.

## Technology Stack Constraints

The following technology decisions are binding for the project:

| Layer           | Technology             | Constraint                          |
|-----------------|------------------------|-------------------------------------|
| Framework       | Next.js (App Router)   | MUST use React Server Components    |
| Language        | TypeScript (strict)    | No plain JS files in `src/`         |
| ORM             | Prisma                 | MUST be sole database access layer  |
| Database        | Neon Postgres          | Serverless; no local PG dependency  |
| Object Storage  | Cloudflare R2          | Upload via presigned URLs only      |
| CDN             | Cloudflare             | All media served through CDN        |
| Auth            | NextAuth.js + Google   | Email-allowlist access control      |
| Maps            | Leaflet + OpenStreetMap| No paid map API keys                |
| Markdown        | remark + rehype        | Server-side rendering with sanitize |
| Deployment      | Fly.io (Docker)        | Multi-stage Alpine builds, Node 20  |
| Testing         | Vitest + Testing Lib   | Co-located test files               |

Adding a new technology or replacing an existing one MUST be proposed
as a constitution amendment with justification and migration plan.

## Development Workflow & Review Process

### Branch Strategy

- All work MUST happen on feature branches off `main`.
- Branch names MUST follow the pattern `###-feature-name` matching
  the spec number.
- Direct pushes to `main` are prohibited.

### Pull Request Requirements

Every PR MUST satisfy these gates before merge:

1. **All tests pass** — CI MUST run the full test suite.
2. **Lint & format clean** — zero warnings, zero errors.
3. **Constitution compliance** — reviewer MUST verify the PR does not
   violate any Core Principle.
4. **Core Web Vitals check** — for UI-facing changes, Lighthouse CI
   or equivalent MUST confirm no regression in LCP, INP, or CLS.
5. **No TODO debt** — no `TODO` comments MUST be introduced without
   a linked tracking issue.

### Commit Discipline

- Commits MUST be atomic: one logical change per commit.
- Commit messages MUST use conventional format:
  `type(scope): description` (e.g., `feat(map): add marker clustering`).

## Governance

This constitution is the highest authority for development decisions
in capturewashington.org. When practices conflict, the constitution
wins.

### Amendment Process

1. Propose the change as a PR modifying this file.
2. Include a rationale section explaining why the change is needed.
3. Update the version number following semantic versioning:
   - **MAJOR**: Removing or fundamentally redefining a principle.
   - **MINOR**: Adding a new principle or materially expanding scope.
   - **PATCH**: Clarifications, typo fixes, non-semantic refinements.
4. Update `LAST_AMENDED_DATE` to the merge date.
5. Run the consistency propagation checklist: verify plan, spec, and
   task templates still align with the updated principles.

### Compliance

- Every PR review MUST include a constitution compliance check.
- Violations MUST be resolved before merge unless a documented
  exception is granted and tracked.
- Quarterly review: principles SHOULD be revisited each quarter to
  confirm they remain relevant and achievable.

**Version**: 1.0.0 | **Ratified**: 2026-04-03 | **Last Amended**: 2026-04-03
