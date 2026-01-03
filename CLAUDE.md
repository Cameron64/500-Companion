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
│   │   └── api/             # API routes (events feed, etc.)
│   ├── collections/         # Payload collection configs
│   ├── globals/             # Payload global configs
│   ├── components/          # React components
│   │   └── ui/              # Shared UI components
│   └── lib/                 # Utilities and Payload client
├── docs/                    # Documentation and plans
├── public/                  # Static assets, PWA manifest
├── scripts/                 # Seed scripts
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

```bash
DATABASE_URL=postgresql://user:password@localhost:5434/500companion
PAYLOAD_SECRET=your-secret-key
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Notes

- Admin panel accessible at `/admin`
- First user created becomes admin
- Rich text uses Lexical editor
- Images auto-resize to: thumbnail (400x300), card (768x576), tablet (1024), desktop (1920)
- Calendar fetches events from `/api/events/feed`
