# capturewashington.org

A catalogue of historic buildings across Washington state. Each entry includes photos, location data, and written context rendered from Markdown.

## Stack

- **Framework:** Next.js 16 (App Router, standalone output)
- **Language:** TypeScript 5 (strict mode)
- **Database:** Neon Postgres via Prisma
- **Auth:** NextAuth.js (Google OAuth)
- **Storage:** Cloudflare R2 (S3-compatible)
- **Maps:** Leaflet + react-leaflet
- **Hosting:** Fly.io

## Getting Started

```bash
cp .env.example .env.local   # fill in values
just db-up                    # start local Postgres
just db-push                  # push Prisma schema
just dev                      # start dev server at localhost:3000
```

## Development

```bash
just test          # run tests
just lint          # run ESLint
just format        # format with Prettier
just format-check  # check formatting
```

## Deployment

Merges to `main` trigger CI and auto-deploy to Fly.io via GitHub Actions.

Manual deploy:

```bash
just deploy
```

Requires `FLY_API_TOKEN` set as a GitHub Actions secret for automated deploys.
