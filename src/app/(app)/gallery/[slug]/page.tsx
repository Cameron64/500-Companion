import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAlbum } from '@/lib/payload'
import type { Metadata } from 'next'

interface AlbumPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { slug } = await params
  const album = await getAlbum(slug)

  if (!album) {
    return {
      title: 'Album Not Found | The 500 Companion',
    }
  }

  return {
    title: `${album.title} | Gallery | The 500 Companion`,
    description: album.description || `Photo album: ${album.title}`,
  }
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params
  const album = await getAlbum(slug)

  if (!album) {
    notFound()
  }

  const photos = album.photos || []

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/gallery"
        className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        &larr; Back to Gallery
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">{album.title}</h1>
        <div className="flex items-center gap-4 text-gray-500">
          {album.date && (
            <time>
              {new Date(album.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          )}
          <span>{photos.length} photos</span>
        </div>
        {album.description && (
          <p className="text-gray-600 mt-4">{album.description}</p>
        )}
      </header>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => {
            if (typeof photo !== 'object' || !photo) return null

            return (
              <div
                key={photo.id || index}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
              >
                <Image
                  src={photo.url || ''}
                  alt={photo.alt || `Photo ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.caption}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No photos in this album yet.</p>
        </div>
      )}

      {album.tags && album.tags.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {album.tags.map((tagItem, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tagItem.tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
