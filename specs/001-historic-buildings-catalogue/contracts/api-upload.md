# API Contract: Upload

## POST /api/upload/presign

Generate a presigned URL for direct browser-to-R2 upload.

**Auth**: Required (role: ADMIN or SUPER_ADMIN)

**Request Body**:

```json
{
  "filename": "string (required)",
  "contentType": "string (required, MIME type)",
  "fileSize": "number (required, bytes)",
  "entryId": "string (required, target entry ID)"
}
```

**Validation** (performed server-side before generating URL):

- `fileSize` ≤ 52,428,800 (50 MB)
- `contentType` must be one of: `image/jpeg`, `image/png`,
  `image/webp`, `image/avif`, `video/mp4`, `video/webm`
- Entry must not already have 20 media items

**Response 200**:

```json
{
  "uploadUrl": "string (presigned PUT URL, 15-min expiry)",
  "r2Key": "string (generated object key, e.g. media/{entryId}/{uuid}.{ext})"
}
```

**Response 400**:

```json
{
  "error": "string",
  "details": {
    "field": "string",
    "constraint": "string"
  }
}
```

**Response 403**: Not authenticated or insufficient role.

## Upload Flow (client-side)

1. Client calls `POST /api/upload/presign` with file metadata
2. Server validates constraints and returns presigned URL + r2Key
3. Client `PUT`s file directly to `uploadUrl` with `Content-Type` header
4. On success (HTTP 200 from R2), client calls
   `POST /api/entries/[id]/media` with `{ r2Key, type, mimeType, fileSize }`
5. Server creates Media record linked to the entry
