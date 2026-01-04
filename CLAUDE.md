# The 500 Companion

A personal PWA for managing and sharing content about "The 500" property. Built for a 70-year-old property owner to easily share updates, events, photos, and visitor information with friends and family.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **CMS**: Payload CMS 3.x (embedded, admin at `/admin`)
- **Database**: PostgreSQL (via `@payloadcms/db-postgres`)
- **Styling**: Tailwind CSS
- **Rich Text**: Lexical Editor (`@payloadcms/richtext-lexical`)
- **Calendar**: FullCalendar v6 (`@fullcalendar/react`)
- **PWA**: Service worker + manifest for offline support

## Quick Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Database
docker-compose up -d     # Start local PostgreSQL (port 5434)
npm run payload migrate  # Run database migrations

# Payload CMS
npm run generate:types   # Regenerate payload-types.ts
npm run seed             # Seed initial content

# Production
npm run build            # Build for production
npm run start            # Start production server
```

## Project Structure

```
/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (app)/           # Public site routes
│   │   ├── (payload)/       # Payload admin routes
│   │   └── api/             # API routes (events feed, health, etc.)
│   ├── collections/         # Payload collection configs
│   ├── globals/             # Payload global configs
│   ├── components/          # React components
│   │   └── ui/              # Shared UI components
│   ├── lib/                 # Utilities and Payload client
│   └── migrations/          # Payload database migrations
├── docs/                    # Documentation and plans
├── public/                  # Static assets, PWA manifest
├── scripts/                 # Seed scripts
├── server.js                # Custom production server (Railway)
├── railway.toml             # Railway deployment config
├── payload.config.ts        # Main Payload configuration
└── tailwind.config.ts       # Tailwind configuration
```

## Key Files

| File | Purpose |
|------|---------|
| `src/payload.config.ts` | Main Payload CMS configuration |
| `src/lib/payload.ts` | Payload client + data fetching functions |
| `src/app/(app)/layout.tsx` | Public site layout (nav, footer) |
| `src/app/api/events/feed/route.ts` | Calendar event feed API |
| `src/app/api/health/route.ts` | Health check endpoint for Railway |
| `server.js` | Custom Node.js server for production |
| `railway.toml` | Railway deployment configuration |
| `docker-compose.yml` | Local PostgreSQL setup |

## Content Collections

- **Updates** - Blog posts/news with rich text, images, tags
- **Events** - Calendar events with date/time, location, visibility (public/friends-only/private)
- **Pages** - Static pages (Visitor Guide, About) with offline caching option
- **Albums** - Photo albums with multiple images
- **Media** - File uploads with auto-generated image sizes

## Access Control

- **Admin**: Full access to all content and admin panel
- **Friend**: Can view friends-only events (V2 feature)
- **Public**: Can only view published public content

## Environment Variables

### Local Development
```bash
DATABASE_URL=postgresql://user:password@localhost:5434/500companion
PAYLOAD_SECRET=your-secret-key
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Railway)
```bash
DATABASE_URL=postgresql://...@postgres.railway.internal:5432/railway  # Auto-set by Railway
PAYLOAD_SECRET=<generated-secret>
PAYLOAD_PUBLIC_SERVER_URL=https://500-companion-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://500-companion-production.up.railway.app
PORT=3000  # Must be 3000 to match Railway domain config
```

## Deployment (Railway)

**Production URL**: https://500-companion-production.up.railway.app

### Architecture
- **Platform**: Railway (Nixpacks builder)
- **Database**: Railway PostgreSQL (internal networking)
- **Custom Server**: `server.js` - Required for proper port binding with Payload CMS

### Key Deployment Files

| File | Purpose |
|------|---------|
| `railway.toml` | Railway deployment configuration |
| `server.js` | Custom Node.js server for production |
| `src/migrations/` | Payload database migrations |
| `src/app/api/health/route.ts` | Health check endpoint |

### railway.toml Configuration
```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
preDeployCommand = "npx payload migrate"  # Run migrations before app starts
startCommand = "npm start"                 # Uses server.js
healthcheckPath = "/api/health"
healthcheckTimeout = 120
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[[services]]
name = "web"
internalPort = 3000
protocol = "TCP"
```

### Deployment Process
1. Push to `main` branch triggers automatic deployment
2. Nixpacks builds the Next.js application
3. `preDeployCommand` runs Payload migrations
4. `server.js` starts, binding to `0.0.0.0:3000`
5. Healthcheck verifies `/api/health` responds

### Creating Migrations
```bash
# After changing Payload collection schemas:
npx payload migrate:create   # Creates new migration in src/migrations/
git add src/migrations/
git commit -m "Add migration for <change>"
git push  # Triggers deployment, migration runs automatically
```

### Troubleshooting Deployment

**502 Bad Gateway**
- Check PORT environment variable matches domain target port (must be 3000)
- Verify app binds to `0.0.0.0`, not `localhost`
- Check deploy logs: `railway logs`

**Migration Failures**
- Migrations run via `npx payload migrate` (not `npm run payload migrate` - avoids devDependency issues)
- Check DATABASE_URL is set correctly
- View migration logs in Railway deploy logs

**Healthcheck Failures**
- Ensure `/api/health` endpoint exists and returns 200
- Increase `healthcheckTimeout` if app needs more startup time

### Railway CLI Commands
```bash
railway login           # Authenticate
railway link            # Link to project
railway logs            # View deploy logs
railway variables       # List environment variables
railway variables --set "KEY=value"  # Set variable
```

## Development Notes

- Admin panel accessible at `/admin`
- First user created becomes admin
- Rich text uses Lexical editor
- Images auto-resize to: thumbnail (400x300), card (768x576), tablet (1024), desktop (1920)
- Calendar fetches events from `/api/events/feed`
- **Important**: Next.js standalone mode is NOT compatible with Payload CMS - use custom `server.js` instead
