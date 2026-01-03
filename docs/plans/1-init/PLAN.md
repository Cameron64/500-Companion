# The 500 Companion - Implementation Plan

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 15 (App Router) | Latest stable, native React Server Components, excellent PWA support |
| **CMS** | Payload 3.x | Best Next.js integration, powerful admin UI, TypeScript-first |
| **Database** | PostgreSQL (via Railway) | Robust, excellent JSON support, Railway native integration |
| **File Storage** | Local dev → Railway Volumes (MVP) → Cloudflare R2 (V1+) | Simple start, scalable path, cost-effective |
| **Auth** | Payload built-in + simple JWT | Email/password for admin, optional friends access via shared collections |
| **PWA** | next-pwa + Workbox | Industry standard, good offline support, minimal config |
| **Calendar** | FullCalendar v6 + @fullcalendar/react | Mature, feature-rich, good mobile support |
| **Deployment** | Railway (all environments) | Single platform, postgres + app + volumes, simple env promotion |
| **Styling** | Tailwind CSS | Fast development, mobile-first, good Payload admin theming |

---

## Phase Breakdown

### MVP (Week 1-2) - Core CMS + Basic Public Site

**Goal**: Admin can log in, create content, public can view it.

**Acceptance Criteria**:
- ✅ Payload admin accessible at `/admin`
- ✅ Admin can create/edit: Updates, Events, Pages, Photos
- ✅ Public homepage shows recent updates
- ✅ Events page displays calendar view (month)
- ✅ Basic photo gallery with albums
- ✅ Responsive design works on mobile
- ✅ Deployed to Railway dev environment
- ✅ Database backups configured

**Features**:
- Collections: Updates, Events, Pages, Photos, Albums, SiteSettings
- Public routes: `/`, `/updates`, `/events`, `/gallery`, `/visitor-guide`, `/about`
- Basic authentication (admin only)
- Simple responsive theme

---

### V1 (Week 3-4) - PWA + Enhanced UX

**Goal**: Installable app, offline visitor guides, rich admin experience.

**Acceptance Criteria**:
- ✅ App installable as PWA on mobile/desktop
- ✅ Offline access to visitor guide pages
- ✅ Photo uploads with automatic resizing
- ✅ Event filtering and list view
- ✅ Share links for albums/events work properly
- ✅ Admin can preview content before publishing
- ✅ Production environment live
- ✅ Staging environment for testing

**Features**:
- PWA manifest + service worker
- Offline page caching strategy
- Image optimization (Sharp)
- Draft/publish workflow
- SEO metadata per page
- Social sharing cards

---

### V2 (Week 5-6) - Friends Access + Polish

**Goal**: Invite-only access for friends, advanced calendar features.

**Acceptance Criteria**:
- ✅ "Friends" user role with limited access
- ✅ Recurring events support
- ✅ Event RSVP (optional)
- ✅ Photo tagging and filtering
- ✅ Search functionality
- ✅ Email notifications for new updates (optional)
- ✅ Admin audit log
- ✅ Performance monitoring

**Features**:
- Access control per collection
- FullCalendar recurring events
- Advanced photo organization
- Contact form
- Analytics (privacy-friendly)

---

## Technology Stack Details

### Next.js Configuration

```
Next.js 15.x
- App Router (not Pages Router)
- TypeScript
- React Server Components where possible
- Middleware for auth redirects
```

**Directory Structure**:
```
/app
  /(app)              # Public site routes
    /layout.tsx
    /page.tsx         # Homepage
    /updates/...
    /events/...
    /gallery/...
  /(payload)          # Payload admin
    /admin/[[...segments]]/page.tsx
  /api                # API routes (if needed beyond Payload)
/collections          # Payload collection configs
/components
  /blocks             # Payload blocks
  /ui                 # Public site components
/lib
  /utils
  /payload-client.ts
/public
  /icons              # PWA icons
  /manifest.json
/docs
/payload.config.ts
/next.config.js
```

---

### Payload CMS Configuration

**Version**: Payload 3.x (latest stable)

**Integration Pattern**:
- Payload as library (not standalone)
- Runs within Next.js app
- Admin UI at `/admin`
- Shares same server process

**Collections Design**:

#### 1. **Updates** (Blog Posts/News)
```typescript
{
  slug: 'updates',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, admin: { position: 'sidebar' } },
    { name: 'content', type: 'richText', required: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] }
  ],
  access: {
    read: ({ req }) => req.user || { status: { equals: 'published' } },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'status'],
    preview: (doc) => `/updates/${doc.slug}`
  }
}
```

#### 2. **Events**
```typescript
{
  slug: 'events',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'description', type: 'richText' },
    { name: 'startDate', type: 'date', required: true, admin: { date: { displayFormat: 'MMM d, yyyy h:mm a' } } },
    { name: 'endDate', type: 'date' },
    { name: 'allDay', type: 'checkbox', defaultValue: false },
    { name: 'location', type: 'text' },
    { name: 'locationCoords', type: 'point' }, // lat/lng for map
    { name: 'eventType', type: 'select', options: ['public', 'friends-only', 'private'], defaultValue: 'public' },
    { name: 'maxAttendees', type: 'number' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'status', type: 'select', options: ['draft', 'published', 'cancelled'], defaultValue: 'draft' },
    // V2: Recurring events
    { name: 'recurrence', type: 'group', fields: [
      { name: 'enabled', type: 'checkbox' },
      { name: 'frequency', type: 'select', options: ['daily', 'weekly', 'monthly'] },
      { name: 'interval', type: 'number', defaultValue: 1 },
      { name: 'endDate', type: 'date' }
    ]}
  ],
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { status: { equals: 'published' }, eventType: { not_equals: 'private' } };
    }
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'eventType', 'status']
  }
}
```

#### 3. **Pages** (Visitor Guide, About, etc.)
```typescript
{
  slug: 'pages',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, required: true },
    { name: 'content', type: 'richText', required: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'offlineAvailable', type: 'checkbox', defaultValue: false }, // For PWA offline caching
    { name: 'showInNav', type: 'checkbox', defaultValue: true },
    { name: 'navOrder', type: 'number', defaultValue: 0 },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
    { name: 'seo', type: 'group', fields: [
      { name: 'title', type: 'text' },
      { name: 'description', type: 'textarea' },
      { name: 'ogImage', type: 'upload', relationTo: 'media' }
    ]}
  ],
  access: {
    read: ({ req }) => req.user || { status: { equals: 'published' } }
  },
  admin: {
    useAsTitle: 'title'
  }
}
```

#### 4. **Albums**
```typescript
{
  slug: 'albums',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'coverPhoto', type: 'upload', relationTo: 'media' },
    { name: 'photos', type: 'relationship', relationTo: 'media', hasMany: true },
    { name: 'date', type: 'date' }, // Album date (e.g., trip date)
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'visibility', type: 'select', options: ['public', 'friends', 'private'], defaultValue: 'public' },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' }
  ],
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { status: { equals: 'published' }, visibility: { equals: 'public' } };
    }
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'visibility', 'status']
  }
}
```

#### 5. **Media** (Photos/Files)
```typescript
{
  slug: 'media',
  upload: {
    staticDir: 'media', // Local dev
    // Production: will use adapter for R2/S3
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'tablet', width: 1024, height: undefined },
      { name: 'desktop', width: 1920, height: undefined }
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*']
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'textarea' },
    { name: 'credit', type: 'text' },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'location', type: 'text' },
    { name: 'takenAt', type: 'date' }
  ],
  access: {
    read: () => true // Public read, admin write
  }
}
```

#### 6. **Users**
```typescript
{
  slug: 'users',
  auth: true,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', options: ['admin', 'friend'], defaultValue: 'friend', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' }
  ],
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin'
  },
  admin: {
    useAsTitle: 'name'
  }
}
```

#### 7. **SiteSettings** (Global)
```typescript
{
  slug: 'site-settings',
  global: true,
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'The 500 Companion' },
    { name: 'tagline', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'contactEmail', type: 'email' },
    { name: 'socialLinks', type: 'group', fields: [
      { name: 'facebook', type: 'text' },
      { name: 'instagram', type: 'text' },
      { name: 'twitter', type: 'text' }
    ]},
    { name: 'navigation', type: 'array', fields: [
      { name: 'label', type: 'text' },
      { name: 'page', type: 'relationship', relationTo: 'pages' }
    ]},
    { name: 'footer', type: 'richText' },
    { name: 'maintenanceMode', type: 'checkbox', defaultValue: false }
  ],
  access: {
    read: () => true,
    update: ({ req }) => !!req.user
  }
}
```

---

## Database Strategy

**Choice**: PostgreSQL on Railway

**Rationale**:
- Railway provides managed Postgres with automatic backups
- Excellent JSON/JSONB support for Payload's flexible schema
- Mature, proven, open-source
- Easy to export/migrate if needed

**Setup**:
- Local: `docker-compose.yml` with Postgres 16
- Dev/Prod: Railway Postgres plugin
- Connection pooling: PgBouncer (Railway native support)

**Migrations**:
- Payload handles schema migrations automatically
- Version control: commit Payload's generated migration files
- Seeding: `/scripts/seed.ts` for initial content (site settings, default pages)

**Backups**:
- Railway: automatic daily backups (14-day retention)
- Manual exports: weekly cron job → Railway volume or R2
- Restoration procedure documented in `/docs/runbook.md`

---

## File Storage Strategy

### MVP (Local + Railway Volumes)
- **Local dev**: `/media` directory
- **Railway dev/prod**: Railway persistent volumes (500GB)
- **Pros**: Simple, no external dependencies
- **Cons**: Volume backups manual, scaling limited

### V1+ (Cloudflare R2)
- **All environments**: Cloudflare R2 (S3-compatible)
- **Cost**: $0.015/GB storage, zero egress fees
- **Integration**: `@payloadcms/plugin-cloud-storage` with S3 adapter
- **Backups**: R2 object versioning + lifecycle rules

**Migration path**:
1. Add R2 bucket
2. Install storage plugin
3. Sync existing files: `rclone sync media/ r2:500-companion-media`
4. Update env vars, redeploy

---

## Authentication & Access Control

### Admin Users
- **Method**: Payload built-in auth (email + password)
- **Password policy**:
  - Minimum 12 characters
  - Require mixed case, numbers, symbols (enforced in collection config)
- **2FA**: Use Payload's `@payloadcms/plugin-2fa` (V2 feature)
- **Session**: JWT tokens (7-day expiry), httpOnly cookies
- **Rate limiting**: `@payloadcms/plugin-rate-limit` (10 login attempts/hour)

### Friends Access (V2)
- **Users collection** with `role: 'friend'`
- Admin creates friend accounts, sends invite email
- Friends can:
  - View "friends-only" events
  - Comment on updates (optional)
  - RSVP to events (optional)
- Cannot access admin UI

### Public Access
- No auth required
- Read-only access to published, public content
- Middleware protects admin routes

**Access Control Pattern**:
```typescript
// Example: Events collection
access: {
  read: ({ req }) => {
    if (req.user?.role === 'admin') return true;
    if (req.user?.role === 'friend') {
      return {
        status: { equals: 'published' },
        eventType: { in: ['public', 'friends-only'] }
      };
    }
    // Public
    return {
      status: { equals: 'published' },
      eventType: { equals: 'public' }
    };
  }
}
```

---

## PWA Implementation

### Manifest (`/public/manifest.json`)
```json
{
  "name": "The 500 Companion",
  "short_name": "500",
  "description": "Your guide to The 500",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["lifestyle", "travel"],
  "screenshots": []
}
```

### Service Worker Strategy
**Tool**: `next-pwa` with Workbox

**Caching Strategy**:
1. **App Shell** (Network First):
   - Layout, navigation, core CSS/JS
   - Cache for 24 hours, revalidate

2. **Static Pages** (Cache First):
   - Pages marked `offlineAvailable: true`
   - Visitor guide, about page
   - Pre-cache during install

3. **Dynamic Content** (Network First, Stale While Revalidate):
   - Updates, events, gallery
   - Show cached version if offline, warn user

4. **Images** (Cache First):
   - Media files (photos)
   - Max 500 items, 30-day expiry

5. **API/CMS** (Network Only):
   - Payload admin always online
   - No caching of admin data

**Configuration** (`next.config.js`):
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|webp|png|gif|svg|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 }
      }
    }
  ]
});
```

### Install Prompt
- Custom install button in navigation (desktop)
- Bottom banner on mobile (dismissible, remembers choice)
- Trigger `beforeinstallprompt` event listener

### Offline Fallback
- `/app/offline/page.tsx` shown when offline + no cache
- Lists available offline pages
- Shows cached photos count

### Push Notifications (V2 - Optional)
- Web Push API for new updates
- Opt-in only
- Admin can trigger from Payload admin

---

## FullCalendar Integration

### Installation
```bash
npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/list @fullcalendar/interaction
```

### Event Feed
- API route: `/app/api/events/feed/route.ts`
- Returns events in FullCalendar JSON format
- Filters by date range (query params: `start`, `end`)
- Respects access control (public vs friends)

```typescript
// /app/api/events/feed/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const events = await payload.find({
    collection: 'events',
    where: {
      status: { equals: 'published' },
      startDate: { greater_than_equal: start, less_than_equal: end }
    }
  });

  return Response.json(
    events.docs.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate || event.startDate,
      allDay: event.allDay,
      url: `/events/${event.slug}`,
      extendedProps: {
        location: event.location,
        type: event.eventType
      }
    }))
  );
}
```

### Calendar Component (`/components/EventCalendar.tsx`)
```tsx
'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

export function EventCalendar() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listWeek'
      }}
      events="/api/events/feed"
      eventClick={(info) => {
        info.jsEvent.preventDefault();
        if (info.event.url) {
          window.location.href = info.event.url;
        }
      }}
      height="auto"
      // Mobile-friendly settings
      eventTimeFormat={{
        hour: 'numeric',
        minute: '2-digit',
        meridiem: 'short'
      }}
    />
  );
}
```

### Views Needed
1. **Month View** (`dayGridMonth`): Default, shows all events
2. **List View** (`listWeek`): Better for mobile, shows event details

### Event Detail Page
- Route: `/app/events/[slug]/page.tsx`
- Fetches event from Payload
- Shows full description, location (map embed), RSVP button (V2)
- Share button (native Web Share API)

### Timezone Handling
- Store all dates in UTC (Postgres `timestamptz`)
- Display in user's local timezone (browser default)
- Admin can set default timezone in site settings (used for display hints)

### Recurring Events (V2)
- Use `rrule` library for recurrence rules
- Store base event + recurrence config in Payload
- Generate instances dynamically in API route
- FullCalendar displays expanded instances

---

## UI Plan

### Public Site Structure

#### 1. **Homepage** (`/app/page.tsx`)
- Hero section: Featured photo, site name, tagline
- Recent updates (3 cards, link to all)
- Upcoming events (list, link to calendar)
- Photo gallery preview (latest album)
- CTA: "Install App" (PWA prompt)

#### 2. **Updates** (`/app/updates/page.tsx`)
- Paginated list of updates (12 per page)
- Filter by tag
- Each card: image, title, excerpt, date
- Individual update page: `/app/updates/[slug]/page.tsx`

#### 3. **Events** (`/app/events/page.tsx`)
- FullCalendar component (month view default)
- Toggle to list view
- Filter: All / Upcoming / Past
- Individual event page: `/app/events/[slug]/page.tsx`

#### 4. **Gallery** (`/app/gallery/page.tsx`)
- Grid of album covers
- Click album → `/app/gallery/[slug]/page.tsx`
  - Photo grid (masonry layout)
  - Lightbox for fullscreen view
  - Share album link
- Filter by tag

#### 5. **Visitor Guide** (`/app/visitor-guide/page.tsx`)
- Static page from Payload Pages collection
- Sections: Getting Here, Rules, What to Bring, Safety, Map
- Marked `offlineAvailable: true` for PWA caching

#### 6. **About** (`/app/about/page.tsx`)
- Story of The 500
- Contact info
- Owner bio

#### 7. **Contact** (`/app/contact/page.tsx`)
- Simple form (V2)
- Email, embedded map

### Design System (Tailwind Config)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#10b981', // Green (nature theme)
          900: '#064e3b'
        },
        secondary: {
          500: '#f59e0b' // Amber (warmth)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      }
    }
  }
};
```

### Mobile-First Responsive Breakpoints
- Mobile: 320px - 640px (base styles)
- Tablet: 640px - 1024px (`md:`)
- Desktop: 1024px+ (`lg:`)

### Admin Experience
- **Primary**: Payload admin at `/admin`
- **No custom admin UI** unless absolutely necessary
- Payload's preview feature for draft content
- Media library for photo management
- Rich text editor: Lexical (Payload default) or Slate

---

## Deployment Architecture

### Railway Setup

**Project Structure**:
```
Railway Project: 500-companion
├── Service: web (Next.js app)
│   ├── Environment: local (for testing Railway setup)
│   ├── Environment: dev
│   └── Environment: production
├── Plugin: PostgreSQL
│   ├── Database: dev
│   └── Database: production
└── Plugin: Volumes (optional, if not using R2)
    ├── Volume: dev-media
    └── Volume: prod-media
```

### Environment Variables

**Local** (`.env.local`):
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/500companion

# Payload
PAYLOAD_SECRET=your-32-char-secret-here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Storage (local)
STORAGE_TYPE=local
MEDIA_DIR=./media

# Email (optional, for notifications)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

**Dev/Production** (Railway):
```bash
# Database (Railway provides this)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Payload
PAYLOAD_SECRET=${{secrets.PAYLOAD_SECRET}} # Generate unique per env
PAYLOAD_PUBLIC_SERVER_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Next.js
NEXT_PUBLIC_APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production

# Storage (R2)
STORAGE_TYPE=s3
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_BUCKET=500-companion-media-dev # or -prod
S3_ACCESS_KEY_ID=${{secrets.R2_ACCESS_KEY}}
S3_SECRET_ACCESS_KEY=${{secrets.R2_SECRET_KEY}}
S3_REGION=auto

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=${{secrets.SENDGRID_API_KEY}}

# Monitoring (optional)
SENTRY_DSN=${{secrets.SENTRY_DSN}}
```

### Railway Configuration

**`railway.toml`**:
```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[[services]]
name = "web"
```

**Build Command** (`package.json`):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "payload migrate && next build",
    "start": "next start",
    "migrate": "payload migrate",
    "generate:types": "payload generate:types",
    "seed": "tsx ./scripts/seed.ts"
  }
}
```

### Deployment Flow

1. **Local Development**:
   ```bash
   docker-compose up -d  # Start local Postgres
   npm run dev           # Start Next.js + Payload
   ```

2. **Push to Dev**:
   ```bash
   git push origin dev
   # Railway auto-deploys dev environment
   ```

3. **Promote to Production**:
   ```bash
   git push origin main
   # Railway auto-deploys production
   # OR use Railway CLI: railway up --environment production
   ```

### Custom Domain Setup
- Dev: `dev.the500companion.com` (Railway auto-SSL)
- Prod: `the500companion.com` (Railway auto-SSL)
- Configure DNS: CNAME → Railway provided domain

---

## Backup & Restore Strategy

### Database Backups

**Automated** (Railway):
- Daily snapshots (14-day retention)
- Point-in-time recovery available

**Manual** (Weekly):
```bash
# Railway CLI
railway run pg_dump > backup-$(date +%Y%m%d).sql

# Restore
railway run psql < backup-20250115.sql
```

**Off-site** (V2):
- Cron job in Railway: weekly export → R2 bucket
- Retention: 4 weeks rolling

### Media Backups

**R2 Storage**:
- Object versioning enabled (30-day)
- Lifecycle rule: delete versions > 30 days

**Local Sync**:
```bash
# Download all media
rclone sync r2:500-companion-media-prod ./backup/media
```

### Restoration Procedure

1. Database:
   ```bash
   railway run psql < backup.sql
   railway restart
   ```

2. Media:
   ```bash
   rclone sync ./backup/media r2:500-companion-media-prod
   ```

3. Verify: Check admin UI, test public site

---

## Security Hardening

### Admin Protection

1. **Strong Passwords**:
   - Enforce via Payload config:
   ```typescript
   auth: {
     verify: false, // No email verification (private site)
     maxLoginAttempts: 5,
     lockTime: 600000, // 10 min
     forgotPassword: {
       generateEmailHTML: ({ token, user }) => `...`
     }
   }
   ```

2. **2FA** (V2):
   - Install `@payloadcms/plugin-2fa`
   - TOTP via authenticator app

3. **Rate Limiting**:
   ```typescript
   // payload.config.ts
   plugins: [
     rateLimit({
       enabled: true,
       max: 10, // 10 requests
       window: 60000, // per minute
       endpoints: ['/api/users/login', '/api/users/forgot-password']
     })
   ]
   ```

4. **Admin Path Obscurity** (optional):
   - Change admin path from `/admin` to `/manage` or custom
   - Security through obscurity (not primary defense)

### API Security

- **CORS**: Restrict to own domain
- **CSRF**: Payload handles via tokens
- **XSS**: React escapes by default, sanitize rich text output
- **SQL Injection**: Payload ORM prevents, but validate inputs

### Environment Secrets

- Never commit `.env` files
- Use Railway secrets for production
- Rotate `PAYLOAD_SECRET` annually

### Monitoring

**Audit Logs** (V2):
- Log all admin actions (create/update/delete)
- Collection: `audit-logs`
- Fields: user, action, collection, timestamp, changes (JSON)

**Error Tracking**:
- Sentry for production errors
- Slack webhook for critical alerts

---

## Monitoring & Logging

### Application Monitoring

**Railway Logs**:
- Built-in log aggregation
- Search, filter by timestamp
- Alerts on error rate spikes

**Sentry** (V2):
```bash
npm install @sentry/nextjs
```
- Track errors, performance
- Release tracking for deploy correlation

### Performance Monitoring

**Next.js Analytics**:
- Vercel Analytics (if using Vercel)
- OR custom: Plausible/Simple Analytics (privacy-friendly)

**Key Metrics**:
- Core Web Vitals (LCP, FID, CLS)
- Time to First Byte (TTFB)
- Page load times

**Lighthouse CI** (V2):
- Run on each deploy
- Enforce thresholds (Performance > 90, Accessibility > 95)

### Database Monitoring

- Railway dashboard: CPU, memory, connections
- Slow query log (enable in Postgres)
- Alert on connection pool exhaustion

---

## Migration & Seeding

### Initial Content Seed

**Script**: `/scripts/seed.ts`
```typescript
import payload from 'payload';

async function seed() {
  await payload.init({ secret: process.env.PAYLOAD_SECRET, local: true });

  // Create admin user
  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@the500companion.com',
      password: 'CHANGE_ME_ON_FIRST_LOGIN',
      role: 'admin',
      name: 'Admin'
    }
  });

  // Create site settings
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'The 500 Companion',
      tagline: 'Your Guide to The 500',
      description: 'Share updates and visitor information for The 500 property.'
    }
  });

  // Create default pages
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Visitor Guide',
      slug: 'visitor-guide',
      content: [{ type: 'paragraph', children: [{ text: 'Welcome! Add your guide content here.' }] }],
      offlineAvailable: true,
      showInNav: true,
      navOrder: 1,
      status: 'published'
    }
  });

  // More default pages...

  console.log('Seed complete!');
  process.exit(0);
}

seed();
```

**Run**:
```bash
npm run seed
```

### Schema Migrations

- Payload auto-generates migrations on schema changes
- Migrations stored in `/src/migrations/`
- Version control all migration files
- Run before deploy: `npm run migrate` (included in build step)

### Staging Environment

**Purpose**: Test migrations, new features before production

**Setup**:
- Railway environment: `staging`
- Separate database (copy of production)
- Same R2 bucket (different prefix: `staging/`)

**Workflow**:
1. Merge feature → `staging` branch
2. Railway auto-deploys to staging env
3. Test thoroughly
4. Merge staging → `main` (production)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **70-year-old finds admin too complex** | High | Medium | Simplify Payload admin with custom labels, hide advanced fields, create video walkthrough, set up initial content together |
| **Railway downtime/outages** | High | Low | Set up uptime monitoring (UptimeRobot), have backup hosting plan (Vercel + Supabase), export backups weekly |
| **Photo storage costs balloon** | Medium | Medium | Implement image optimization (Sharp), set max upload size (5MB), use R2 (no egress fees), monitor usage |
| **Database migration fails during deploy** | High | Low | Test migrations on staging first, backup before deploy, keep rollback script ready |
| **PWA caching issues (stale content)** | Medium | Medium | Use Network First for dynamic content, add cache-busting via versioning, provide "clear cache" button |
| **Spam/abuse on public forms** | Medium | Medium | Add rate limiting, Turnstile CAPTCHA (Cloudflare), email notifications for new submissions |
| **Slow initial page loads (large images)** | Medium | High | Lazy load images, use Next.js Image component, implement progressive image loading, optimize with Sharp |
| **Mobile calendar UX poor** | Medium | Medium | Test on real devices early, prioritize list view on mobile, add swipe gestures, simplify month view |
| **Vendor lock-in (Payload/Railway)** | Low | Low | Use standard Postgres, export data regularly, document migration path to self-hosted |
| **Friend auth confusion** | Low | Medium | Clear invite emails, password reset flow, admin can impersonate to troubleshoot (audit log) |

---

## First Week Task List

### Day 1: Project Setup

```bash
# 1. Initialize Next.js with TypeScript
npx create-next-app@latest 500-companion --typescript --tailwind --app --eslint
cd 500-companion

# 2. Install Payload
npm install payload @payloadcms/db-postgres @payloadcms/richtext-lexical

# 3. Install additional dependencies
npm install @payloadcms/plugin-cloud-storage @payloadcms/plugin-seo sharp
npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/list

# 4. Install PWA support
npm install next-pwa

# 5. Install dev dependencies
npm install -D @types/node tsx

# 6. Set up Docker for local Postgres
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: 500companion
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
EOF

# 7. Start local database
docker-compose up -d

# 8. Create environment file
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/500companion
PAYLOAD_SECRET=YOUR_SECRET_HERE_CHANGE_ME
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
STORAGE_TYPE=local
EOF

# 9. Initialize git
git init
git add .
git commit -m "Initial project setup"
```

### Day 2: Payload Configuration

**File**: `/payload.config.ts`
```typescript
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- The 500 Companion',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },
  collections: [
    // Import collection configs from /collections
  ],
  globals: [
    // Import global configs
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
  }),
  editor: lexicalEditor({}),
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
});
```

**Create Collection Configs**:
```bash
mkdir -p collections
touch collections/Users.ts
touch collections/Updates.ts
touch collections/Events.ts
touch collections/Pages.ts
touch collections/Albums.ts
touch collections/Media.ts
```

**Implement each collection** (copy from "Collections Design" section above)

### Day 3: Next.js Integration

**File**: `/app/(payload)/admin/[[...segments]]/page.tsx`
```typescript
import { generatePageMetadata } from '@payloadcms/next/utilities';
import config from '@payload-config';
import { RootPage } from '@payloadcms/next/views';
import { importMap } from '@/importMap';

type Args = {
  params: { segments: string[] };
  searchParams: { [key: string]: string | string[] };
};

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap });

export default Page;
```

**File**: `/next.config.js`
```javascript
const { withPayload } = require('@payloadcms/next/withPayload');
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPayload(
  withPWA({
    images: {
      domains: ['localhost'],
    },
  })
);
```

**Start dev server**:
```bash
npm run dev
```

**Visit**: `http://localhost:3000/admin` (create first admin user)

### Day 4: Public Site Structure

**Create routes**:
```bash
mkdir -p app/(app)
touch app/(app)/layout.tsx
touch app/(app)/page.tsx
mkdir -p app/(app)/updates
touch app/(app)/updates/page.tsx
mkdir -p app/(app)/events
touch app/(app)/events/page.tsx
mkdir -p app/(app)/gallery
touch app/(app)/gallery/page.tsx
```

**Shared Layout** (`/app/(app)/layout.tsx`):
```tsx
import { getSiteSettings } from '@/lib/payload-client';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation settings={settings} />
      <main className="flex-grow">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
```

**Homepage** (`/app/(app)/page.tsx`):
```tsx
import { getPayloadHMR } from '@payloadcms/next/utilities';
import config from '@payload-config';

export default async function HomePage() {
  const payload = await getPayloadHMR({ config });

  const recentUpdates = await payload.find({
    collection: 'updates',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 3,
  });

  const upcomingEvents = await payload.find({
    collection: 'events',
    where: {
      status: { equals: 'published' },
      startDate: { greater_than: new Date().toISOString() },
    },
    sort: 'startDate',
    limit: 5,
  });

  return (
    <div>
      <section className="hero">
        <h1>Welcome to The 500</h1>
        {/* ... */}
      </section>

      <section className="recent-updates">
        {/* Render recentUpdates */}
      </section>

      <section className="upcoming-events">
        {/* Render upcomingEvents */}
      </section>
    </div>
  );
}
```

### Day 5: FullCalendar Integration

**API Route**: `/app/api/events/feed/route.ts`
```typescript
import { getPayloadHMR } from '@payloadcms/next/utilities';
import config from '@payload-config';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const payload = await getPayloadHMR({ config });

  const events = await payload.find({
    collection: 'events',
    where: {
      status: { equals: 'published' },
      startDate: {
        greater_than_equal: start,
        less_than_equal: end,
      },
    },
  });

  const calendarEvents = events.docs.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate || event.startDate,
    allDay: event.allDay,
    url: `/events/${event.slug}`,
  }));

  return Response.json(calendarEvents);
}
```

**Component**: `/components/EventCalendar.tsx`
```tsx
'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

export function EventCalendar() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, listPlugin]}
      initialView="dayGridMonth"
      events="/api/events/feed"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listWeek',
      }}
      height="auto"
    />
  );
}
```

**Page**: `/app/(app)/events/page.tsx`
```tsx
import { EventCalendar } from '@/components/EventCalendar';

export default function EventsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      <EventCalendar />
    </div>
  );
}
```

### Day 6: PWA Setup

**Manifest**: `/public/manifest.json`
```json
{
  "name": "The 500 Companion",
  "short_name": "500",
  "description": "Your guide to The 500",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Generate Icons**:
- Use https://realfavicongenerator.net/
- Upload a 512x512 source image
- Download and place in `/public/icons/`

**Update Layout** (`/app/layout.tsx`):
```tsx
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#10b981',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The 500',
  },
};
```

**Test PWA**:
- Run `npm run build && npm start`
- Open Chrome DevTools → Lighthouse
- Run PWA audit
- Install app from browser

### Day 7: Railway Deployment

**1. Create Railway Project**:
```bash
npm install -g @railway/cli
railway login
railway init
# Select: Create new project
# Name: 500-companion
```

**2. Add Postgres**:
```bash
railway add --plugin postgresql
```

**3. Set Environment Variables**:
```bash
railway variables set PAYLOAD_SECRET=$(openssl rand -base64 32)
railway variables set NODE_ENV=production
# Railway auto-provides DATABASE_URL and RAILWAY_PUBLIC_DOMAIN
```

**4. Configure Build**:
```bash
cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/"
restartPolicyType = "on_failure"
EOF
```

**5. Deploy**:
```bash
git add .
git commit -m "Add Railway configuration"
railway up
```

**6. Create Admin User**:
```bash
railway run npm run seed
```

**7. Verify**:
- Visit deployed URL
- Log into `/admin`
- Create test content

---

## Next Steps After Week 1

### Week 2: Polish & Testing
- [ ] Responsive design testing (mobile, tablet)
- [ ] Add image optimization
- [ ] Implement draft/publish workflow
- [ ] SEO metadata for all pages
- [ ] Share links functionality
- [ ] Staging environment setup

### Week 3: V1 Features
- [ ] Photo gallery with lightbox
- [ ] Album organization
- [ ] PWA offline caching for visitor guide
- [ ] Event detail pages
- [ ] Social sharing cards

### Week 4: Production Launch
- [ ] Custom domain setup
- [ ] SSL configuration
- [ ] Production database setup
- [ ] Backup automation
- [ ] Admin training session with owner
- [ ] Content migration

### Week 5-6: V2 Features
- [ ] Friends access control
- [ ] Recurring events
- [ ] Photo tagging
- [ ] Search functionality
- [ ] Email notifications
- [ ] 2FA for admin

---

## Maintenance & Operations

### Weekly Tasks
- [ ] Review Railway logs for errors
- [ ] Check disk usage (media)
- [ ] Verify backups completed
- [ ] Update dependencies (patch versions)

### Monthly Tasks
- [ ] Security updates (npm audit fix)
- [ ] Database cleanup (old drafts)
- [ ] Review analytics/performance
- [ ] Backup database locally

### Quarterly Tasks
- [ ] Major dependency updates
- [ ] Security audit
- [ ] Performance optimization review
- [ ] User feedback review with owner

---

## Support & Documentation

### For Non-Technical Owner

**Create**: `/docs/ADMIN_GUIDE.md`
- How to log in
- Creating updates (with screenshots)
- Uploading photos
- Creating events
- Publishing vs drafts
- Troubleshooting common issues

**Create**: `/docs/VIDEO_TUTORIALS.md`
- Links to screen recordings for each task
- Hosted on YouTube (unlisted)

### For Developer

**Create**: `/docs/RUNBOOK.md`
- Local setup steps
- Deployment process
- Rollback procedure
- Database restore
- Common errors & fixes

**Create**: `/docs/ARCHITECTURE.md`
- System diagram
- Data flow
- Tech stack details
- API documentation

---

## Success Metrics

### Launch Criteria (MVP)
- [ ] Admin can create all content types without assistance
- [ ] Public site loads in < 3s on 3G
- [ ] PWA score > 90 (Lighthouse)
- [ ] Mobile usability score > 95
- [ ] Zero critical accessibility issues
- [ ] Admin training completed
- [ ] Backups tested and verified

### V1 Success
- [ ] 100+ photos uploaded by owner
- [ ] 10+ events created
- [ ] PWA installed by 5+ friends
- [ ] Offline mode works for visitor guide
- [ ] Owner reports "easy to use"

### V2 Success
- [ ] 20+ friends registered
- [ ] Event RSVPs working
- [ ] Search used regularly
- [ ] Zero support requests in 30 days
- [ ] Owner independent for all content tasks

---

## Budget Estimate

### Development Time
- **MVP**: 80 hours
- **V1**: 40 hours
- **V2**: 40 hours
- **Total**: 160 hours

### Hosting (Monthly)
- **Railway**: $5-20 (hobby plan, scales with usage)
- **Postgres**: Included in Railway plan
- **R2 Storage**: ~$1-5 (1000 photos ≈ 5GB)
- **Domain**: $10-15/year
- **Total**: ~$10-30/month

### Third-Party Services (Optional)
- **SendGrid**: Free tier (100 emails/day)
- **Sentry**: Free tier (5k events/month)
- **Plausible**: $9/month (privacy analytics)

---

## Conclusion

This plan provides a clear path from initial setup to a fully-featured PWA for The 500 Companion. The phased approach allows for early validation with the owner while building toward advanced features. By prioritizing simplicity and using Payload's excellent admin UI, we minimize the need for custom development and ensure the 70-year-old owner can confidently manage content.

**Key Success Factors**:
1. Start simple, iterate based on real usage
2. Involve owner early and often
3. Prioritize mobile UX
4. Maintain excellent documentation
5. Automate backups and deployments
6. Keep costs predictable and low

**First Action**: Run the Day 1 setup commands and create the Railway project.
