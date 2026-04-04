# Quickstart: WA Historic Buildings Catalogue

## Prerequisites

- [Bun](https://bun.sh) (latest)
- Node.js 20+ (for Prisma CLI compatibility)
- A Neon Postgres database (free tier works)
- Google Cloud project with OAuth 2.0 credentials
- Cloudflare R2 bucket with API token

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd capturewashington.org
bun install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable               | Where to get it                                            |
| ---------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`         | Neon dashboard → Connection string                         |
| `NEXTAUTH_URL`         | `http://localhost:3000` for dev                            |
| `NEXTAUTH_SECRET`      | `openssl rand -base64 32`                                  |
| `GOOGLE_CLIENT_ID`     | Google Cloud Console → APIs & Services                     |
| `GOOGLE_CLIENT_SECRET` | Same as above                                              |
| `INITIAL_ADMIN_EMAIL`  | Your Google account email                                  |
| `R2_ACCOUNT_ID`        | Cloudflare dashboard → R2                                  |
| `R2_ACCESS_KEY_ID`     | R2 API token                                               |
| `R2_SECRET_ACCESS_KEY` | R2 API token                                               |
| `R2_BUCKET_NAME`       | Your R2 bucket name                                        |
| `R2_PUBLIC_URL`        | CDN subdomain (e.g. `https://media.capturewashington.org`) |

### 3. Initialize database

```bash
bunx prisma db push
```

This creates all tables in your Neon database. For the full-text
search and geographic extensions, run:

```bash
bunx prisma db execute --stdin <<SQL
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
SQL
```

### 4. Run development server

```bash
bun run dev
```

Open `http://localhost:3000`. The timeline will show an empty state.

### 5. First admin login

1. Navigate to `/admin`
2. Sign in with the Google account matching `INITIAL_ADMIN_EMAIL`
3. You will be auto-promoted to super-admin
4. Create your first entry from the admin dashboard

## Common Tasks

### Create a production build

```bash
bun run build
```

### Run tests

```bash
bun test
```

### Run linting

```bash
bun run lint
```

### Generate Prisma client after schema changes

```bash
bunx prisma generate
```

### Run database migrations in production

```bash
bunx prisma db push
```

## Deployment (Fly.io)

```bash
fly launch        # First time only
fly deploy        # Subsequent deploys
fly secrets set DATABASE_URL=... NEXTAUTH_SECRET=... # Set env vars
```

## Verification Checklist

- [ ] Homepage loads with empty state message
- [ ] `/admin` redirects unauthenticated users
- [ ] Google OAuth sign-in works with `INITIAL_ADMIN_EMAIL`
- [ ] Admin dashboard is accessible after sign-in
- [ ] New entry can be created in Draft status
- [ ] Entry can be published and appears on timeline
- [ ] Media upload works (photo appears in gallery)
- [ ] Map page shows pins for published entries
- [ ] Search returns matching entries
