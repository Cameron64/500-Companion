import { getPayload } from 'payload'
import config from '@payload-config'

export const getPayloadClient = async () => {
  return getPayload({ config })
}

export async function getSiteSettings() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({
    slug: 'site-settings',
  })
  return settings
}

export async function getUpdates(options?: { limit?: number; page?: number }) {
  const payload = await getPayloadClient()
  const updates = await payload.find({
    collection: 'updates',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: options?.limit || 10,
    page: options?.page || 1,
  })
  return updates
}

export async function getUpdate(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'updates',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getEvents(options?: {
  limit?: number
  upcoming?: boolean
  start?: string
  end?: string
}) {
  const payload = await getPayloadClient()
  const now = new Date().toISOString()

  const where: Record<string, unknown> = {
    status: { equals: 'published' },
    eventType: { in: ['public', 'friends-only'] },
  }

  if (options?.upcoming) {
    where.startDate = { greater_than: now }
  }

  if (options?.start) {
    where.startDate = {
      ...where.startDate as Record<string, unknown>,
      greater_than_equal: options.start
    }
  }

  if (options?.end) {
    where.startDate = {
      ...where.startDate as Record<string, unknown>,
      less_than_equal: options.end
    }
  }

  const events = await payload.find({
    collection: 'events',
    where,
    sort: 'startDate',
    limit: options?.limit || 100,
  })
  return events
}

export async function getEvent(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getAlbums(options?: { limit?: number }) {
  const payload = await getPayloadClient()
  const albums = await payload.find({
    collection: 'albums',
    where: {
      status: { equals: 'published' },
      visibility: { equals: 'public' },
    },
    sort: '-date',
    limit: options?.limit || 20,
  })
  return albums
}

export async function getAlbum(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'albums',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2, // Include nested media
  })
  return result.docs[0] || null
}

export async function getPage(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getNavPages() {
  const payload = await getPayloadClient()
  const pages = await payload.find({
    collection: 'pages',
    where: {
      status: { equals: 'published' },
      showInNav: { equals: true },
    },
    sort: 'navOrder',
  })
  return pages.docs
}
