# Feature Specification: WA Historic Buildings Catalogue

**Feature Branch**: `001-historic-buildings-catalogue`
**Created**: 2026-04-03
**Status**: Draft
**Input**: User description: "Full-application specification for capturewashington.org — a public-facing photo and video catalogue of historic buildings in Washington state with blog-style timeline, interactive map, markdown entries, role-based admin, media uploads, and full search."

## Clarifications

### Session 2026-04-03

- Q: Should entries support a draft state, or are they always published instantly? → A: Draft → Published → Archived — three-state lifecycle for full editorial control.
- Q: What media upload constraints should the system enforce? → A: 50 MB per file, 20 files per entry. Accepted formats: JPEG/PNG/WebP/AVIF (photo), MP4/WebM (video).
- Q: Should entry deletion be soft (recoverable) or hard (permanent)? → A: Soft delete — entries are marked deleted and retained; super-admins can restore them.
- Q: How should the homepage timeline load more entries? → A: Infinite scroll — automatically loads more entries as the visitor scrolls near the bottom.
- Q: When an admin edits a title, should the URL slug update? → A: Slug never changes — set once at creation, preserving bookmarks and SEO.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Browse Historic Building Timeline (Priority: P1)

A visitor arrives at the homepage and sees a chronologically ordered
timeline of historic building entries. Each entry shows a title,
thumbnail image, location name, and capture date. The visitor scrolls
through the timeline to discover buildings and clicks an entry to read
the full write-up.

**Why this priority**: The timeline is the primary discovery surface
and the core value proposition — without it, there is no product.

**Independent Test**: Load the homepage, verify entries appear in
reverse chronological order with title, thumbnail, location, and date.
Click an entry and confirm it navigates to the detail page.

**Acceptance Scenarios**:

1. **Given** the database contains 10 entries, **When** a visitor loads the homepage, **Then** they see entries displayed in reverse chronological order by capture date with title, thumbnail, location name, and date visible for each.
2. **Given** an entry has no associated media, **When** the timeline renders, **Then** a placeholder image is displayed instead of a broken image.
3. **Given** more entries than fit on one screen, **When** the visitor scrolls near the bottom, **Then** additional entries load automatically via infinite scroll without a full page refresh.

---

### User Story 2 - View Individual Building Entry (Priority: P1)

A visitor clicks an entry from the timeline or map and sees the full
detail page: rendered markdown body, photo/video gallery, location on
an embedded map, capture date, and associated tags.

**Why this priority**: The entry detail page is the content
destination — the reason visitors come to the site. Co-equal with the
timeline as the core reading experience.

**Independent Test**: Navigate to an entry page by slug, verify the
markdown body renders as HTML, media gallery displays photos/videos,
the embedded map shows a pin at the entry's coordinates, and tags are
listed.

**Acceptance Scenarios**:

1. **Given** an entry with markdown body containing headings, links, and images, **When** a visitor loads the entry page, **Then** the markdown is rendered as sanitized HTML with correct formatting.
2. **Given** an entry with 5 photos and 1 video, **When** the visitor views the media gallery, **Then** all 6 media items are displayed in the defined sort order, with photos viewable and video playable.
3. **Given** an entry with tags "Art Deco" and "Spokane", **When** the visitor views the entry, **Then** both tags are displayed and each links to a filtered view of entries sharing that tag.

---

### User Story 3 - Explore Buildings on Interactive Map (Priority: P2)

A visitor opens the full map view and sees pins for every catalogued
building. Clicking a pin shows a brief summary popup with a link to
the full entry. The visitor can pan, zoom, and get an at-a-glance view
of geographic coverage.

**Why this priority**: The map view is the secondary discovery surface
that differentiates this catalogue from a generic blog. Important but
not required for an initial MVP read experience.

**Independent Test**: Open the map page, verify all entries appear as
pins at correct coordinates. Click a pin, verify the popup shows
title, thumbnail, and link. Click the link, verify navigation to the
entry page.

**Acceptance Scenarios**:

1. **Given** 50 entries across Washington state, **When** the visitor opens the map, **Then** all 50 pins are plotted at their correct lat/lng coordinates.
2. **Given** the visitor clicks a map pin, **When** the popup appears, **Then** it shows the entry title, thumbnail, and a link to the full entry page.
3. **Given** multiple entries in close proximity, **When** the map is zoomed out, **Then** pins are visually distinguishable or clustered so the map remains usable.

---

### User Story 4 - Admin Creates a New Entry (Priority: P2)

An authenticated admin navigates to the admin dashboard, clicks
"New Entry," fills in the title, markdown body, location (via map
picker or manual lat/lng), capture date, and tags, uploads one or more
photos/videos, and publishes the entry.

**Why this priority**: Without content creation, the catalogue has
nothing to display. Ranked P2 because seed data can be loaded directly
for early testing, but admin UI is essential before launch.

**Independent Test**: Log in as admin, create an entry with all
fields, upload a photo, submit. Verify the entry appears on the public
timeline and map with correct data and media.

**Acceptance Scenarios**:

1. **Given** an admin is authenticated, **When** they fill out the new entry form with title, body, location, date, and tags and save, **Then** the entry is created in Draft state and is not visible on the public site until explicitly published.
2. **Given** the admin is on the new entry form, **When** they select a location on the map picker, **Then** the latitude and longitude fields are populated automatically.
3. **Given** the admin uploads 3 photos, **When** the upload completes, **Then** all 3 photos are associated with the entry and appear in the media gallery with drag-to-reorder capability.
4. **Given** a non-admin user attempts to access `/admin`, **When** the page loads, **Then** they are redirected away and cannot access any admin functionality.

---

### User Story 5 - Admin Edits an Existing Entry (Priority: P2)

An admin selects an entry from the admin dashboard, modifies any field
(title, body, location, date, tags, media), and saves the changes.
The public site reflects the updates.

**Why this priority**: Corrections and additions to existing entries
are routine. Grouped with creation as core admin workflow.

**Independent Test**: Edit an existing entry's title and add a new
photo. Verify the public entry page shows the updated title and
includes the new photo in the gallery.

**Acceptance Scenarios**:

1. **Given** an admin is editing an entry, **When** they change the title and save, **Then** the updated title appears on the public timeline and entry page.
2. **Given** an admin is editing media, **When** they remove a photo and add a new one, **Then** the old photo is deleted from storage and the new one appears in the gallery.
3. **Given** an admin changes an entry's tags, **When** they save, **Then** the entry appears under the new tags and no longer under removed tags in filtered views.

---

### User Story 6 - Search and Filter Entries (Priority: P3)

A visitor uses search to find specific buildings by keyword, tag, date
range, or geographic proximity. Results update in real time and can be
viewed in timeline or map mode.

**Why this priority**: Search enhances discovery but the site is
usable without it. Appropriate for later phases once core content and
views exist.

**Independent Test**: Search for a keyword that appears in one entry's
title. Verify only that entry appears in results. Apply a tag filter.
Verify results include only entries with that tag. Set a date range.
Verify entries outside the range are excluded. Set a location radius
around Seattle. Verify only nearby entries appear.

**Acceptance Scenarios**:

1. **Given** the visitor types "City Hall" in the search bar, **When** results load, **Then** only entries with "City Hall" in the title or body are displayed.
2. **Given** the visitor selects tag "Art Deco", **When** the filter is applied, **Then** only entries tagged "Art Deco" are shown.
3. **Given** the visitor sets a date range of 1920–1940, **When** the filter is applied, **Then** only entries with capture dates within that range are shown.
4. **Given** the visitor sets a location radius of 50 miles around Seattle, **When** the filter is applied, **Then** only entries within that radius are shown.
5. **Given** the visitor combines keyword "Hotel" with tag "Seattle", **When** both filters are active, **Then** only entries matching both criteria are displayed.

---

### User Story 7 - Admin Manages Users and Roles (Priority: P3)

A super-admin can invite new admins, assign roles, and revoke access
from the admin dashboard. Role changes take effect immediately.

**Why this priority**: Multi-user admin is a refinement over
single-admin. Required before public launch if multiple contributors
are expected, but not needed for initial development.

**Independent Test**: As super-admin, invite a new user by email.
Verify they can log in and access admin features. Revoke their access.
Verify they can no longer access admin pages.

**Acceptance Scenarios**:

1. **Given** a super-admin is on the user management page, **When** they add a new admin by email, **Then** that user can authenticate via Google OAuth and access admin features.
2. **Given** a super-admin revokes an admin's access, **When** the revoked user tries to access `/admin`, **Then** they are redirected and denied access.
3. **Given** two role levels exist (admin, super-admin), **When** a regular admin logs in, **Then** they can create and edit entries but cannot manage other users.

---

### User Story 8 - Media Playback and CDN Delivery (Priority: P3)

Photos load quickly via CDN with appropriate caching. Videos play
inline with standard controls. All media uses modern formats for
optimal performance.

**Why this priority**: Media delivery optimization is important for
user experience and performance but can be layered on after the basic
upload and display flow works.

**Independent Test**: Load an entry page with a large photo. Verify
the image loads from the CDN domain, is served in WebP/AVIF format,
and has long-lived cache headers. Play a video. Verify it streams
without requiring a full download first.

**Acceptance Scenarios**:

1. **Given** an entry page with a 5 MB original photo, **When** the page loads, **Then** the image is served from the CDN in an optimized format and loads within 2 seconds on a 4G connection.
2. **Given** an entry page with a video, **When** the visitor clicks play, **Then** the video plays inline with standard playback controls (play/pause, seek, volume, fullscreen).
3. **Given** a returning visitor loads a previously viewed entry, **Then** cached media loads from the browser cache without a network request.

---

### Edge Cases

- What happens when an entry has no media at all? A meaningful
  placeholder is shown; the page remains fully functional.
- What happens when the database is empty? The timeline shows a
  friendly empty state message, and the map shows Washington state
  with no pins.
- What happens when an admin uploads an unsupported file type?
  The upload is rejected before transfer with a clear error message
  listing accepted formats.
- What happens when the database is hibernating after inactivity?
  The first request experiences a cold-start delay; a loading
  indicator is shown rather than a timeout error.
- What happens when a visitor accesses a non-existent entry slug?
  A 404 page is displayed with navigation back to the timeline.
- What happens when a search query returns zero results? A helpful
  empty state is shown suggesting the visitor broaden their search.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a chronologically ordered timeline
  of building entries on the homepage with infinite scroll that
  automatically loads the next batch as the visitor nears the bottom.
- **FR-002**: System MUST render each entry's markdown body as
  sanitized HTML on the entry detail page.
- **FR-003**: System MUST display an interactive map with a pin for
  every entry, including popup previews linking to entry pages.
- **FR-004**: System MUST allow authenticated admins to create, edit,
  and delete entries including title, markdown body, location
  coordinates, capture date, tags, and media. Entries follow a
  three-state lifecycle: Draft → Published → Archived. Only
  published entries are visible on the public site. Admins can
  transition entries between any adjacent states. Deletion is
  soft: entries are marked deleted and hidden but retained in the
  database. Super-admins can restore soft-deleted entries.
- **FR-005**: System MUST support direct browser-to-storage media
  uploads via presigned URLs, without proxying file data through the
  application server. Uploads MUST be limited to 50 MB per file and
  20 files per entry. Accepted formats: JPEG, PNG, WebP, AVIF
  (photos) and MP4, WebM (video). Files outside these constraints
  MUST be rejected before transfer begins.
- **FR-006**: System MUST serve media through a CDN with long-lived
  cache headers and support modern image formats (WebP/AVIF).
- **FR-007**: System MUST authenticate users via Google OAuth and
  enforce role-based access control with at least two roles:
  super-admin (full access including user management) and admin
  (content management only).
- **FR-008**: System MUST support full-text keyword search across
  entry titles and bodies.
- **FR-009**: System MUST support filtering entries by tag, date
  range, and geographic proximity (radius from a point).
- **FR-010**: System MUST generate unique URL slugs from entry titles
  at creation time for human-readable permalinks. Slugs MUST NOT
  change when the title is subsequently edited.
- **FR-011**: System MUST display video media with inline playback
  controls.
- **FR-012**: System MUST provide a location picker (interactive map
  or coordinate input) in the admin entry form.
- **FR-013**: System MUST allow admins to reorder media within an
  entry.
- **FR-014**: System MUST allow super-admins to invite, role-assign,
  and revoke access for other admin users.
- **FR-015**: System MUST be deployable as a single containerized
  service.

### Key Entities

- **Entry**: A historic building record — title, slug, markdown body,
  location (name, latitude, longitude), capture date, status
  (draft / published / archived), timestamps.
  Has many Media and many Tags.
- **Media**: A photo or video associated with an entry — storage key,
  media type (photo/video), sort order. Belongs to one Entry.
- **Tag**: A categorization label — unique name. Can be associated
  with many Entries.
- **User**: An admin account — email, role (super-admin or admin),
  timestamps. Authenticated via external identity provider.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Visitors can discover and read a building entry within
  3 clicks from the homepage (timeline → entry, or map → pin → entry).
- **SC-002**: The homepage timeline loads and displays entries within
  2.5 seconds on a standard 4G mobile connection.
- **SC-003**: An admin can create a complete entry (text + 3 photos)
  in under 5 minutes.
- **SC-004**: Search results return within 1 second for any
  combination of keyword, tag, date, and location filters.
- **SC-005**: The site scores "Good" on all three Core Web Vitals
  (LCP, INP, CLS) as measured on representative public pages.
- **SC-006**: All media loads via CDN with cache-hit rates above 90%
  for returning visitors.
- **SC-007**: The map page renders and is interactive (pan/zoom/click)
  within 3 seconds with 100+ entries plotted.
- **SC-008**: Non-admin users cannot access any admin functionality —
  100% of unauthorized access attempts are blocked.

## Assumptions

- Visitors have a modern browser (last 2 major versions of Chrome,
  Firefox, Safari, Edge) with JavaScript enabled.
- The site is primarily accessed from within the United States, with
  the majority of traffic from Washington state.
- Entry volume will remain under 10,000 entries for the foreseeable
  future — pagination and search strategies are designed for this
  scale.
- Admin usage is low-volume (1–5 concurrent admins). No need for
  real-time collaboration or conflict resolution on simultaneous edits.
- All media is uploaded by admins — there is no user-generated content
  from public visitors.
- Google OAuth is the sole authentication provider. No
  username/password or other social login methods are needed.
- The site is English-only. No internationalization or localization is
  required.
- Role-based access uses two tiers: super-admin (manages users +
  content) and admin (manages content only). No finer-grained
  permissions are needed initially.
