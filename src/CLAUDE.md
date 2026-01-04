# src/ - Source Code

Main source code for The 500 Companion application.

## Directory Overview

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router - routes, layouts, API endpoints |
| `collections/` | Payload CMS collection configurations |
| `globals/` | Payload CMS global configurations (site settings) |
| `components/` | React components for the public site |
| `lib/` | Utilities, Payload client, helper functions |
| `migrations/` | Payload database migrations (auto-generated) |

## Key Files

| File | Purpose |
|------|---------|
| `payload.config.ts` | **Main Payload CMS config** - collections, globals, database, editor |
| `payload-types.ts` | **Auto-generated** TypeScript types from Payload schema |

## Payload Configuration

The `payload.config.ts` is the central configuration:

```typescript
// Registered collections
collections: [Users, Updates, Events, Pages, Albums, Media]

// Global settings
globals: [SiteSettings]

// Database
db: postgresAdapter({ pool: { connectionString: DATABASE_URL } })

// Rich text editor
editor: lexicalEditor()
```

## Type Generation

After changing any collection/global schema, regenerate types:

```bash
npm run generate:types
```

This updates `payload-types.ts` with TypeScript interfaces for all collections.

## Import Aliases

The project uses `@/` alias for imports from `src/`:

```typescript
import { getPayloadClient } from '@/lib/payload'
import { Navigation } from '@/components/ui/Navigation'
```

## Database Migrations

Migrations are stored in `migrations/` and run automatically during Railway deployment.

### Creating Migrations

After changing any collection or global schema:

```bash
npx payload migrate:create   # Creates migration files
```

This generates:
- `migrations/YYYYMMDD_HHMMSS.ts` - Migration code (up/down functions)
- `migrations/YYYYMMDD_HHMMSS.json` - Schema snapshot
- `migrations/index.ts` - Migration registry

### Running Migrations

```bash
# Local development
npx payload migrate

# Production (Railway)
# Runs automatically via preDeployCommand in railway.toml
```

### Important Notes

- **Always commit migration files** - They must be in the repo for production
- Use `npx payload migrate` (not `npm run payload migrate`) to avoid devDependency issues in production
- Migrations run before the app starts on Railway (via `preDeployCommand`)
