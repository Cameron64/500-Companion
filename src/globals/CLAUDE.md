# globals/ - Payload Global Configurations

Payload globals are singleton documents (only one instance exists).

## SiteSettings (`site-settings`)

The main site configuration, accessible from Payload admin under "Globals".

### Fields

| Field | Type | Purpose |
|-------|------|---------|
| `siteName` | text | Site title (default: "The 500 Companion") |
| `tagline` | text | Subtitle/slogan |
| `description` | textarea | SEO description |
| `logo` | upload (media) | Site logo image |
| `contactEmail` | email | Contact email address |
| `socialLinks` | group | Facebook, Instagram, Twitter URLs |
| `navigation` | array | Custom navigation links |
| `footer` | richText | Footer content |
| `maintenanceMode` | checkbox | Blocks public access when enabled |

### Navigation Array

Each nav item can have:
- `label` (required) - Display text
- `page` - Relationship to Pages collection
- `url` - External URL (alternative to page)

### Access Control

```typescript
access: {
  read: () => true,        // Anyone can read settings
  update: ({ req }) => !!req.user,  // Only logged-in users can update
}
```

## Usage

Fetch settings with the helper function:

```typescript
import { getSiteSettings } from '@/lib/payload'

const settings = await getSiteSettings()
// settings.siteName, settings.contactEmail, etc.
```

## Adding New Globals

1. Create file in `src/globals/`
2. Export a `GlobalConfig`
3. Add to `payload.config.ts` globals array
4. Run `npm run generate:types`
