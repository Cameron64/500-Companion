import Link from 'next/link'
import Image from 'next/image'
import { getUpdates } from '@/lib/payload'

export const metadata = {
  title: 'Updates | The 500 Companion',
  description: 'Latest news and updates from The 500',
}

export default async function UpdatesPage() {
  const updates = await getUpdates({ limit: 12 })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Updates</h1>

      {updates.docs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h2 className="font-semibold text-xl mb-2">
                  <Link
                    href={`/updates/${update.slug}`}
                    className="hover:text-primary-600"
                  >
                    {update.title}
                  </Link>
                </h2>
                {update.excerpt && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{update.excerpt}</p>
                )}
                <div className="flex justify-between items-center">
                  {update.publishedAt && (
                    <time className="text-gray-400 text-sm">
                      {new Date(update.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  )}
                  <Link
                    href={`/updates/${update.slug}`}
                    className="text-primary-600 text-sm font-medium hover:text-primary-700"
                  >
                    Read more &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No updates yet. Check back soon!</p>
        </div>
      )}

      {updates.totalPages > 1 && (
        <div className="flex justify-center mt-12 space-x-2">
          {Array.from({ length: updates.totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/updates?page=${page}`}
              className={`px-4 py-2 rounded ${
                page === updates.page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
