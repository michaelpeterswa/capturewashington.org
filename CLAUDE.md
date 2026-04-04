# CLAUDE.md

## Package Manager

This project uses **Bun** as its package manager and runtime. Do not use npm, yarn, or pnpm. All install, run, and script commands must use `bun` (e.g., `bun install`, `bun run dev`, `bun test`).

## Active Technologies

- TypeScript 5.x (strict mode enabled) + Next.js 14+ (App Router), Prisma, NextAuth.js, Leaflet + react-leaflet, remark + rehype, @aws-sdk/client-s3 (001-historic-buildings-catalogue)
- Neon Postgres (serverless) + Cloudflare R2 (S3-compatible object storage) (001-historic-buildings-catalogue)

## Recent Changes

- 001-historic-buildings-catalogue: Added TypeScript 5.x (strict mode enabled) + Next.js 14+ (App Router), Prisma, NextAuth.js, Leaflet + react-leaflet, remark + rehype, @aws-sdk/client-s3
