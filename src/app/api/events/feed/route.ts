import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import type { Where } from 'payload'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  try {
    const payload = await getPayloadClient()

    const where: Where = {
      status: { equals: 'published' },
      eventType: { in: ['public', 'friends-only'] },
    }

    if (start || end) {
      where.startDate = {
        ...(start && { greater_than_equal: start }),
        ...(end && { less_than_equal: end }),
      }
    }

    const events = await payload.find({
      collection: 'events',
      where,
      sort: 'startDate',
      limit: 100,
    })

    const calendarEvents = events.docs.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate || event.startDate,
      allDay: event.allDay || false,
      url: `/events/${event.slug}`,
      backgroundColor:
        event.eventType === 'friends-only' ? '#f59e0b' : '#10b981',
      borderColor:
        event.eventType === 'friends-only' ? '#d97706' : '#059669',
      extendedProps: {
        location: event.location,
        type: event.eventType,
      },
    }))

    return NextResponse.json(calendarEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json([], { status: 500 })
  }
}
