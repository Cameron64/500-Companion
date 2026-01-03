# lib/ - Utilities and Payload Client

Helper functions and the Payload CMS client.

## Files

### `payload.ts` - Payload Client & Data Functions

The main data access layer for the application.

#### Core Client

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

export const getPayloadClient = async () => {
  return getPayload({ config })
}
```

#### Data Fetching Functions

| Function | Returns | Purpose |
|----------|---------|---------|
| `getSiteSettings()` | Global settings | Site name, contact, socials |
| `getUpdates(options?)` | Paginated updates | Blog posts list |
| `getUpdate(slug)` | Single update or null | Update detail |
| `getEvents(options?)` | Events list | Calendar events |
| `getEvent(slug)` | Single event or null | Event detail |
| `getAlbums(options?)` | Albums list | Photo albums |
| `getAlbum(slug)` | Album with photos | Album detail (depth: 2) |
| `getPage(slug)` | Page or null | Static page content |
| `getNavPages()` | Pages for nav | Pages with showInNav=true |

#### Options Parameters

```typescript
// Updates
getUpdates({ limit?: number, page?: number })

// Events
getEvents({
  limit?: number,
  upcoming?: boolean,  // Only future events
  start?: string,      // ISO date range start
  end?: string,        // ISO date range end
})

// Albums
getAlbums({ limit?: number })
```

## Usage in Pages

```typescript
// In a page component
import { getUpdates, getSiteSettings } from '@/lib/payload'

export default async function HomePage() {
  const [settings, updates] = await Promise.all([
    getSiteSettings(),
    getUpdates({ limit: 3 })
  ])

  return (
    <div>
      <h1>{settings.siteName}</h1>
      {updates.docs.map(update => ...)}
    </div>
  )
}
```

## Access Control

All functions respect Payload's access control:
- Returns only `status: 'published'` for public queries
- Events filter by `eventType` (public vs friends-only)
- Album visibility filtering

## Adding New Functions

1. Add async function to `payload.ts`
2. Use `getPayloadClient()` to get Payload instance
3. Use `payload.find()` or `payload.findGlobal()`
4. Add appropriate where clauses for access control
5. Export the function
