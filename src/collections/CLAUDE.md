# collections/ - Payload CMS Collections

Payload collection configurations define the content types and their schemas.

## Collections Overview

| Collection | Slug | Purpose |
|------------|------|---------|
| `Users.ts` | `users` | Admin and friend user accounts (auth enabled) |
| `Updates.ts` | `updates` | Blog posts/news articles |
| `Events.ts` | `events` | Calendar events with dates, locations, visibility |
| `Pages.ts` | `pages` | Static pages (Visitor Guide, About, etc.) |
| `Albums.ts` | `albums` | Photo album containers |
| `Media.ts` | `media` | File uploads (images) with auto-sizing |

## Common Patterns

### Status Field
Most collections have a `status` field:
- `draft` - Not visible to public
- `published` - Visible based on access rules

### Access Control
```typescript
access: {
  read: ({ req }) => {
    if (req.user?.role === 'admin') return true        // Admin sees all
    if (req.user?.role === 'friend') return {...}      // Friends see some
    return { status: { equals: 'published' } }         // Public sees published
  },
  create: ({ req }) => !!req.user,                     // Must be logged in
  update: ({ req }) => !!req.user,
  delete: ({ req }) => req.user?.role === 'admin',
}
```

### Auto-Generated Slugs
Collections with `slug` field auto-generate from `title`:
```typescript
hooks: {
  beforeValidate: [({ value, data }) => {
    if (!value && data?.title) {
      return data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
    return value
  }]
}
```

## Events Collection Details

The Events collection has special features:

- **Visibility**: `public`, `friends-only`, `private`
- **Status**: `draft`, `published`, `cancelled`
- **Recurrence** (V2): Group field for recurring events
- **Date Picker**: Shows day and time picker

## Media Collection Details

Uploads auto-generate these image sizes:
- `thumbnail`: 400x300 (cropped)
- `card`: 768x576 (cropped)
- `tablet`: 1024px wide
- `desktop`: 1920px wide

## Modifying Collections

1. Edit the collection file
2. Run `npm run generate:types` to update TypeScript types
3. Payload auto-runs migrations on next start

## Adding a New Collection

1. Create `src/collections/MyCollection.ts`
2. Export a `CollectionConfig`
3. Import and add to `payload.config.ts` collections array
4. Regenerate types
