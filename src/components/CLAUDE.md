# components/ - React Components

Reusable React components for the public site.

## Directory Structure

```
components/
├── ui/                    # Shared UI components
│   ├── Navigation.tsx     # Site header with nav links
│   └── Footer.tsx         # Site footer
└── EventCalendar.tsx      # FullCalendar integration
```

## UI Components

### Navigation (`ui/Navigation.tsx`)
Client component with mobile-responsive navigation.

Props:
- `siteName?: string` - Site title to display

Features:
- Sticky header
- Desktop horizontal nav
- Mobile hamburger menu with slide-out
- Hardcoded nav items: Home, Updates, Events, Gallery, Visitor Guide, About

### Footer (`ui/Footer.tsx`)
Server component for site footer.

Props:
- `siteName?: string` - Copyright text
- `contactEmail?: string` - Contact link

## EventCalendar (`EventCalendar.tsx`)
Client component wrapping FullCalendar.

```typescript
'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
```

Features:
- Month grid view (default)
- Week list view
- Fetches events from `/api/events/feed`
- Click event navigates to detail page

## Component Conventions

### Server vs Client Components
- **Server components** (default): No `'use client'` directive, can fetch data directly
- **Client components**: Use `'use client'` at top, for interactivity (state, effects)

### Styling
Components use Tailwind CSS classes. Key design tokens:
- Primary color: `text-primary-600`, `bg-primary-500`
- Fonts: `font-sans` (Inter), `font-serif` (Merriweather)

## Adding Components

1. Create in `components/` or `components/ui/` for shared UI
2. Default to server component unless interactivity needed
3. Add `'use client'` directive for client components
4. Use `@/` imports for other project files
