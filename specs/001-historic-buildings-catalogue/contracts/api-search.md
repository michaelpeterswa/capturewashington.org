# API Contract: Search

## GET /api/search

Search and filter published entries.

**Query Parameters**:

| Param    | Type   | Default | Description                             |
| -------- | ------ | ------- | --------------------------------------- |
| q        | string | —       | Full-text keyword search (title + body) |
| tags     | string | —       | Comma-separated tag IDs                 |
| dateFrom | string | —       | ISO 8601 date, inclusive lower bound    |
| dateTo   | string | —       | ISO 8601 date, inclusive upper bound    |
| lat      | number | —       | Center latitude for proximity search    |
| lng      | number | —       | Center longitude for proximity search   |
| radius   | number | —       | Radius in miles (requires lat + lng)    |
| cursor   | string | —       | Pagination cursor                       |
| limit    | number | 20      | Results per page (max 50)               |

**Filter Behavior**:

- All filters are AND-combined
- `q` uses Postgres `tsquery` with ranking; results ordered by
  relevance when `q` is present, otherwise by `capturedAt DESC`
- `tags` filters entries that have ALL specified tags
- `dateFrom` / `dateTo` filter on `capturedAt`
- `lat` + `lng` + `radius` filters entries within the geographic
  radius using `earthdistance`
- Only `PUBLISHED` entries with `deletedAt IS NULL` are searched

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
      "tags": [{ "id": "string", "name": "string" }],
      "relevance": "number | null"
    }
  ],
  "nextCursor": "string | null",
  "totalCount": "number"
}
```

**Response 400**: Invalid parameter combination (e.g., `radius`
without `lat`/`lng`).
