# Data Model: WA Historic Buildings Catalogue

**Feature**: 001-historic-buildings-catalogue
**Date**: 2026-04-03

## Entity Relationship Overview

```
User (1) ──creates──> (N) Entry (N) <──tagged──> (N) Tag
                            │
                            └── (1) ──has──> (N) Media
```

## Entities

### Entry

The core content record representing a historic building.

| Field        | Type      | Constraints                              |
|--------------|-----------|------------------------------------------|
| id           | String    | Primary key, cuid                        |
| title        | String    | Required, max 200 characters             |
| slug         | String    | Unique, immutable after creation         |
| body         | String    | Required, raw markdown text              |
| locationName | String    | Required, human-readable location name   |
| lat          | Float     | Required, -90 to 90                      |
| lng          | Float     | Required, -180 to 180                    |
| capturedAt   | DateTime  | Required, date the building was captured |
| status       | EntryStatus | Required, default DRAFT                |
| deletedAt    | DateTime? | Null = active, set = soft-deleted        |
| createdAt    | DateTime  | Auto-set on creation                     |
| updatedAt    | DateTime  | Auto-set on update                       |
| createdById  | String    | Foreign key → User.id                    |

**Uniqueness**: `slug`
**Indexes**: `status` + `deletedAt` (public query filter), `capturedAt` (timeline ordering), `search_vector` GIN (full-text search)

**State Transitions**:
```
DRAFT → PUBLISHED → ARCHIVED
  ↑         ↓           ↓
  └─────────┘           │
  ↑                     │
  └─────────────────────┘
```
All transitions are valid between adjacent and non-adjacent states (any admin can move in any direction). Only `PUBLISHED` entries with `deletedAt IS NULL` appear on the public site.

**Soft Delete**: Setting `deletedAt` hides the entry from all views except super-admin recovery. Restoring clears `deletedAt` and sets status to `DRAFT`.

### Media

A photo or video file associated with an entry.

| Field     | Type      | Constraints                               |
|-----------|-----------|-------------------------------------------|
| id        | String    | Primary key, cuid                         |
| entryId   | String    | Foreign key → Entry.id, cascade delete    |
| r2Key     | String    | Required, R2 object key (e.g. `media/abc/photo.jpg`) |
| type      | MediaType | Required, PHOTO or VIDEO                  |
| mimeType  | String    | Required, original MIME type              |
| fileSize  | Int       | Required, bytes, max 52,428,800 (50 MB)   |
| sortOrder | Int       | Required, default 0                       |
| createdAt | DateTime  | Auto-set on creation                      |

**Uniqueness**: `r2Key`
**Indexes**: `entryId` + `sortOrder` (gallery ordering)
**Validation**: Max 20 Media per Entry. Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`, `video/webm`.

**Cascade**: When an entry is hard-deleted (only via direct DB), all associated media records and R2 objects are removed.

### Tag

A categorization label for entries.

| Field | Type   | Constraints             |
|-------|--------|-------------------------|
| id    | String | Primary key, cuid       |
| name  | String | Required, unique, max 50 characters |

**Uniqueness**: `name` (case-insensitive)
**Relationship**: Many-to-many with Entry via implicit join table `_EntryTags`.

### User

An admin account for content management.

| Field     | Type     | Constraints                              |
|-----------|----------|------------------------------------------|
| id        | String   | Primary key, cuid                        |
| email     | String   | Required, unique                         |
| name      | String?  | Optional, from Google OAuth profile      |
| image     | String?  | Optional, profile image URL              |
| role      | UserRole | Required, default ADMIN                  |
| createdAt | DateTime | Auto-set on creation                     |
| updatedAt | DateTime | Auto-set on update                       |

**Uniqueness**: `email`
**Roles**: `SUPER_ADMIN` (full access + user management), `ADMIN` (content management only)

**Bootstrap**: The email in `INITIAL_ADMIN_EMAIL` env var is auto-promoted to `SUPER_ADMIN` on first login.

## Enums

### EntryStatus

| Value     | Meaning                                   |
|-----------|-------------------------------------------|
| DRAFT     | Visible only to admins, not on public site|
| PUBLISHED | Visible on public site                    |
| ARCHIVED  | Hidden from public, retained for reference|

### MediaType

| Value | Meaning        |
|-------|----------------|
| PHOTO | Image file     |
| VIDEO | Video file     |

### UserRole

| Value       | Meaning                                    |
|-------------|--------------------------------------------|
| SUPER_ADMIN | Full access including user management       |
| ADMIN       | Content management only (create/edit/delete)|

## Full-Text Search

A generated `tsvector` column `search_vector` is maintained on the
`Entry` table, combining `title` (weight A) and `body` (weight B).
Updated automatically via a Postgres trigger or Prisma middleware on
insert/update. Queried via `tsquery` with ranking by `ts_rank`.

## Geographic Search

Uses Postgres `earthdistance` + `cube` extensions. Distance
calculation: `earth_distance(ll_to_earth(entry.lat, entry.lng), ll_to_earth(search_lat, search_lng))`. Filtered by radius in meters.
Index: `CREATE INDEX idx_entry_location ON "Entry" USING gist (ll_to_earth(lat, lng));`
