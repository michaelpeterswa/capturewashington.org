# API Contract: Entries

## GET /api/entries

List published entries for the public timeline.

**Query Parameters**:

| Param  | Type   | Default | Description                                           |
| ------ | ------ | ------- | ----------------------------------------------------- |
| cursor | string | —       | Cursor for pagination (entry ID after which to start) |
| limit  | number | 20      | Number of entries per page (max 50)                   |

**Response 200**:

```json
{
  "entries": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "locationName": "string",
      "lat": 0.0,
      "lng": 0.0,
      "capturedAt": "2024-01-15T00:00:00Z",
      "thumbnailUrl": "string | null",
      "tags": [{ "id": "string", "name": "string" }]
    }
  ],
  "nextCursor": "string | null"
}
```

**Notes**: Only returns entries with `status = PUBLISHED` and `deletedAt IS NULL`. Ordered by `capturedAt DESC`, then `id DESC`.

---

## POST /api/entries

Create a new entry (admin only).

**Auth**: Required (role: ADMIN or SUPER_ADMIN)

**Request Body**:

```json
{
  "title": "string (required, max 200)",
  "body": "string (required, markdown)",
  "locationName": "string (required)",
  "lat": "number (required, -90 to 90)",
  "lng": "number (required, -180 to 180)",
  "capturedAt": "string (required, ISO 8601 date)",
  "tagIds": ["string (optional, array of tag IDs)"]
}
```

**Response 201**:

```json
{
  "id": "string",
  "slug": "string",
  "status": "DRAFT"
}
```

**Notes**: Entry is created in `DRAFT` status. Slug is auto-generated from title and is immutable.

---

## GET /api/entries/[id]

Get a single entry by ID.

**Auth**: Optional. Unauthenticated requests only see `PUBLISHED` entries. Admins see all statuses.

**Response 200**:

```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "body": "string",
  "bodyHtml": "string",
  "locationName": "string",
  "lat": 0.0,
  "lng": 0.0,
  "capturedAt": "2024-01-15T00:00:00Z",
  "status": "DRAFT | PUBLISHED | ARCHIVED",
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z",
  "media": [
    {
      "id": "string",
      "url": "string",
      "type": "PHOTO | VIDEO",
      "sortOrder": 0
    }
  ],
  "tags": [{ "id": "string", "name": "string" }]
}
```

**Response 404**: Entry not found or not visible to requester.

---

## PUT /api/entries/[id]

Update an existing entry (admin only).

**Auth**: Required (role: ADMIN or SUPER_ADMIN)

**Request Body**: Same fields as POST, all optional (partial update). Additionally:

```json
{
  "status": "DRAFT | PUBLISHED | ARCHIVED (optional)"
}
```

**Response 200**: Updated entry object.

**Notes**: Slug is never updated, even if title changes.

---

## DELETE /api/entries/[id]

Soft-delete an entry (admin only).

**Auth**: Required (role: ADMIN or SUPER_ADMIN)

**Response 200**:

```json
{
  "id": "string",
  "deletedAt": "2024-01-15T00:00:00Z"
}
```

**Notes**: Sets `deletedAt` timestamp. Does not remove data. Super-admins can restore via `PUT` with `deletedAt: null`.
