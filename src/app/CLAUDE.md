# app/ - Next.js App Router

Routes and layouts for both the public site and Payload admin.

## Route Groups

### `(app)/` - Public Site
The main public-facing website with shared layout (navigation, footer).

| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.tsx` | Homepage - recent updates, upcoming events |
| `/updates` | `updates/page.tsx` | All updates (paginated) |
| `/updates/[slug]` | `updates/[slug]/page.tsx` | Single update detail |
| `/events` | `events/page.tsx` | Calendar view with FullCalendar |
| `/events/[slug]` | `events/[slug]/page.tsx` | Single event detail |
| `/gallery` | `gallery/page.tsx` | Photo albums grid |
| `/gallery/[slug]` | `gallery/[slug]/page.tsx` | Single album with photos |
| `/visitor-guide` | `visitor-guide/page.tsx` | Static visitor info page |
| `/about` | `about/page.tsx` | About page |

**Layout**: `(app)/layout.tsx`
- Loads site settings from Payload
- Renders Navigation and Footer
- Sets up fonts (Inter, Merriweather)
- Configures PWA metadata

### `(payload)/` - Admin Panel
Payload CMS admin interface.

| Route | Purpose |
|-------|---------|
| `/admin` | Payload admin dashboard |
| `/admin/*` | All admin routes (collections, settings) |

**Layout**: `(payload)/layout.tsx` - Minimal wrapper for Payload

### `api/` - API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/events/feed` | GET | FullCalendar event feed (JSON) |
| `/api/[...slug]` | * | Payload REST API |
| `/api/graphql` | POST | Payload GraphQL API |

## Key Components

### Public Layout (`(app)/layout.tsx`)
```typescript
export default async function PublicLayout({ children }) {
  const settings = await getSiteSettings()
  return (
    <Navigation siteName={settings?.siteName} />
    <main>{children}</main>
    <Footer siteName={settings?.siteName} />
  )
}
```

### Data Fetching Pattern
Pages use React Server Components with Payload client:
```typescript
import { getPayloadClient } from '@/lib/payload'

export default async function Page() {
  const payload = await getPayloadClient()
  const data = await payload.find({ collection: 'updates' })
  return <UpdatesList updates={data.docs} />
}
```

## Events Calendar Integration

The events page (`/events`) uses FullCalendar which fetches from `/api/events/feed`:
- Calendar component: `src/components/EventCalendar.tsx` (client component)
- Feed endpoint: `src/app/api/events/feed/route.ts`
- Returns events in FullCalendar JSON format

## Adding a New Route

1. Create folder in `(app)/` matching the URL path
2. Add `page.tsx` with async server component
3. Fetch data using functions from `@/lib/payload`
4. For dynamic routes, use `[slug]` folder naming
