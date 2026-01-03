import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getEvent } from '@/lib/payload'
import type { Metadata } from 'next'

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return {
      title: 'Event Not Found | The 500 Companion',
    }
  }

  return {
    title: `${event.title} | Events | The 500 Companion`,
    description: event.location ? `${event.title} at ${event.location}` : event.title,
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : null

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <Link
        href="/events"
        className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        &larr; Back to Events
      </Link>

      <header className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-primary-50 text-primary-600 rounded-lg p-4 text-center min-w-[80px]">
            <div className="text-sm font-medium uppercase">
              {startDate.toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div className="text-3xl font-bold">{startDate.getDate()}</div>
            <div className="text-sm">{startDate.getFullYear()}</div>
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold">{event.title}</h1>
            {event.eventType === 'friends-only' && (
              <span className="inline-block bg-secondary-100 text-secondary-700 px-2 py-1 rounded text-sm mt-2">
                Friends Only
              </span>
            )}
          </div>
        </div>
      </header>

      {event.featuredImage && typeof event.featuredImage === 'object' && (
        <div className="aspect-video relative rounded-lg overflow-hidden mb-8">
          <Image
            src={event.featuredImage.url || ''}
            alt={event.featuredImage.alt || event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Event Details</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-gray-500 text-sm">Date & Time</dt>
            <dd className="font-medium">
              {event.allDay ? (
                <span>
                  {startDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' (All Day)'}
                </span>
              ) : (
                <span>
                  {startDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' at '}
                  {startDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {endDate && (
                    <>
                      {' - '}
                      {endDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </>
                  )}
                </span>
              )}
            </dd>
          </div>
          {event.location && (
            <div>
              <dt className="text-gray-500 text-sm">Location</dt>
              <dd className="font-medium">{event.location}</dd>
            </div>
          )}
          {event.maxAttendees && (
            <div>
              <dt className="text-gray-500 text-sm">Capacity</dt>
              <dd className="font-medium">{event.maxAttendees} attendees</dd>
            </div>
          )}
        </dl>
      </div>

      {event.description && (
        <div className="prose prose-lg max-w-none">
          <h2 className="font-semibold text-xl mb-4">About This Event</h2>
          {/* RichText content would be rendered here */}
          <div
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(event.description, null, 2),
            }}
          />
        </div>
      )}

      {/* Share Button */}
      <div className="mt-8 pt-8 border-t">
        <button
          type="button"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: event.title,
                url: window.location.href,
              })
            }
          }}
        >
          Share Event
        </button>
      </div>
    </article>
  )
}
