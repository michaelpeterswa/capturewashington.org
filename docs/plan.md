# WA Historic Buildings — Photo Catalogue

A public-facing Next.js photo and video catalogue of historic buildings in Washington state. Blog-style timeline, location-tagged map, markdown per entry, admin upload via Google OAuth.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | RSC for public pages, API routes for admin |
| Hosting | Fly.io | Single containerized service |
| Auth | NextAuth.js + Google OAuth | Session-gated `/admin` routes |
| Database | Neon Postgres (serverless) | Free tier, hibernates when idle |
| ORM | Prisma | Type-safe queries, schema migrations |
| Media storage | Cloudflare R2 | Zero egress fees behind CF CDN |
| CDN | Cloudflare | Serves R2 media via custom subdomain |
| Map | Leaflet + react-leaflet | OSM tiles, no API key required |
| Markdown | remark + rehype | Server-side render, stored as text in Postgres |

---

## Repository Structure

```
.
├── prisma/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx              # Timeline homepage
│   │   │   ├── map/
│   │   │   │   └── page.tsx          # Full map view
│   │   │   └── entry/[id]/
│   │   │       └── page.tsx          # Individual entry
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Auth guard
│   │   │   ├── page.tsx              # Entry list / dashboard
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # New entry form
│   │   │   └── entry/[id]/edit/
│   │   │       └── page.tsx          # Edit entry form
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       │   └── route.ts          # NextAuth handler
│   │       ├── entries/
│   │       │   └── route.ts          # GET list, POST create
│   │       ├── entries/[id]/
│   │       │   └── route.ts          # GET, PUT, DELETE
│   │       └── upload/
│   │           └── presign/
│   │               └── route.ts      # Generate R2 presigned URL
│   ├── components/
│   │   ├── EntryCard.tsx
│   │   ├── EntryMap.tsx              # react-leaflet wrapper
│   │   ├── MediaUploader.tsx         # Client-side presign + upload
│   │   ├── MarkdownRenderer.tsx
│   │   └── MapPin.tsx
│   ├── lib/
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── r2.ts                     # S3-compatible R2 client
│   │   ├── auth.ts                   # NextAuth config
│   │   └── markdown.ts               # remark/rehype pipeline
│   └── types/
│       └── index.ts
├── .env.local                        # Local secrets (gitignored)
├── .env.example
├── Dockerfile
├── fly.toml
└── next.config.ts
```

---

## Data Model

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Entry {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  body        String   // Raw markdown
  locationName String
  lat         Float
  lng         Float
  capturedAt  DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  media       Media[]
  tags        Tag[]    @relation("EntryTags")
}

model Media {
  id        String    @id @default(cuid())
  entryId   String
  entry     Entry     @relation(fields: [entryId], references: [id], onDelete: Cascade)
  r2Key     String    // e.g. "media/abc123/photo.jpg"
  type      MediaType
  sortOrder Int       @default(0)
  createdAt DateTime  @default(now())
}

enum MediaType {
  PHOTO
  VIDEO
}

model Tag {
  id      String  @id @default(cuid())
  name    String  @unique
  entries Entry[] @relation("EntryTags")
}
```

---

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://yourdomain.fly.dev
NEXTAUTH_SECRET=                        # openssl rand -base64 32
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ALLOWED_EMAIL=you@gmail.com             # Only this email can access /admin

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=https://media.yourdomain.com  # CF CDN subdomain pointing at R2
```

---

## Key Implementation Notes

### Auth guard

Protect all `/admin` routes in `src/app/admin/layout.tsx`:

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== process.env.ALLOWED_EMAIL) {
    redirect("/");
  }
  return <>{children}</>;
}
```

### Media upload flow

Direct browser-to-R2 upload to avoid proxying large files through Fly:

1. Admin UI calls `POST /api/upload/presign` with `{ filename, contentType }`
2. API route generates a presigned PUT URL (15-min expiry) via the AWS S3-compatible R2 SDK
3. Browser `PUT`s the file directly to R2 using the presigned URL
4. On success, browser calls the entry API to persist the `r2Key` in Postgres

```ts
// src/lib/r2.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function presignUpload(key: string, contentType: string) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn: 900 }
  );
}
```

### Map component

`react-leaflet` requires a dynamic import (no SSR) since Leaflet touches `window`:

```ts
// src/components/EntryMap.tsx
"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./LeafletMap"), { ssr: false });
export default Map;
```

Store `lat`/`lng` on each entry. The full map page queries all entries and renders a pin per entry linking to `/entry/[id]`.

### Markdown rendering

```ts
// src/lib/markdown.ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export async function renderMarkdown(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md);
  return String(result);
}
```

### Slug generation

Generate from title on create, e.g. `"Old City Hall, Spokane"` → `"old-city-hall-spokane"`. Add a short cuid suffix to guarantee uniqueness.

---

## Dockerfile

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

Add `output: "standalone"` to `next.config.ts`.

---

## fly.toml

```toml
app = "wa-buildings"
primary_region = "sea"

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

`primary_region = "sea"` (Seattle) keeps latency low for a WA-focused audience.

---

## Cloudflare R2 Setup

1. Create bucket in Cloudflare dashboard
2. Create an API token with `Object Read & Write` on that bucket
3. Under the bucket's **Settings → Public access**, connect a custom domain (e.g. `media.yourdomain.com`) — this is what `R2_PUBLIC_URL` points to
4. Set **Cache-Control** default to `public, max-age=31536000, immutable` for media objects

---

## Development Quickstart

```bash
# 1. Install deps
npm install

# 2. Copy env and fill in values
cp .env.example .env.local

# 3. Push schema to Neon
npx prisma db push

# 4. Run locally
npm run dev
```

---

## Phase Plan

| Phase | Scope |
|---|---|
| 1 | Repo scaffold, Prisma schema, Neon connection, basic auth |
| 2 | Public timeline page + individual entry page with markdown render |
| 3 | Admin UI: create/edit entry, location picker on map |
| 4 | R2 upload flow (presign → direct upload → persist key) |
| 5 | Full map page (all pins, click-through to entry) |
| 6 | Dockerfile + fly.toml, deploy to Fly.io |
| 7 | R2 CDN subdomain, Cache-Control headers, video playback |
| 8 | Tags, filtering, polish |
