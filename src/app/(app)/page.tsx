import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings, getUpdates, getEvents, getAlbums } from '@/lib/payload'

// Prevent static generation - needs database at runtime
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const settings = await getSiteSettings()
  const updates = await getUpdates({ limit: 3 })
  const events = await getEvents({ upcoming: true, limit: 5 })
  const albums = await getAlbums({ limit: 4 })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">
            {settings?.siteName || 'The 500 Companion'}
          </h1>
          {settings?.tagline && (
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              {settings.tagline}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/visitor-guide"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Visitor Guide
            </Link>
            <Link
              href="/events"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-3xl font-bold">Recent Updates</h2>
            <Link
              href="/updates"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all &rarr;
            </Link>
          </div>

          {updates.docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {updates.docs.map((update) => (
                <article
                  key={update.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {update.featuredImage && typeof update.featuredImage === 'object' && (
                    <div className="aspect-video relative">
                      <Image
                        src={update.featuredImage.url || ''}
                        alt={update.featuredImage.alt || update.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      <Link
                        href={`/updates/${update.slug}`}
                        className="hover:text-primary-600"
                      >
                        {update.title}
                      </Link>
                    </h3>
                    {update.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2">{update.excerpt}</p>
                    )}
                    {update.publishedAt && (
                      <time className="text-gray-400 text-sm mt-2 block">
                        {new Date(update.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No updates yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-3xl font-bold">Upcoming Events</h2>
            <Link
              href="/events"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View calendar &rarr;
            </Link>
          </div>

          {events.docs.length > 0 ? (
            <div className="space-y-4">
              {events.docs.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block bg-white border rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-50 text-primary-600 rounded-lg p-3 text-center min-w-[60px]">
                      <div className="text-sm font-medium uppercase">
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                        })}
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date(event.startDate).getDate()}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.location && (
                        <p className="text-gray-500 text-sm">{event.location}</p>
                      )}
                      <p className="text-gray-400 text-sm">
                        {event.allDay
                          ? 'All day'
                          : new Date(event.startDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming events. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Photo Gallery Preview */}
      {albums.docs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-3xl font-bold">Photo Gallery</h2>
              <Link
                href="/gallery"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View all albums &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {albums.docs.map((album) => (
                <Link
                  key={album.id}
                  href={`/gallery/${album.slug}`}
                  className="group relative aspect-square rounded-lg overflow-hidden"
                >
                  {album.coverPhoto && typeof album.coverPhoto === 'object' ? (
                    <Image
                      src={album.coverPhoto.url || ''}
                      alt={album.coverPhoto.alt || album.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {album.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
