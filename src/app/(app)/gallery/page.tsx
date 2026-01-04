import Link from 'next/link'
import Image from 'next/image'
import { getAlbums } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Gallery | The 500 Companion',
  description: 'Photo gallery from The 500',
}

export default async function GalleryPage() {
  const albums = await getAlbums({ limit: 20 })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-8">Photo Gallery</h1>

      {albums.docs.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.docs.map((album) => (
            <Link
              key={album.id}
              href={`/gallery/${album.slug}`}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              {album.coverPhoto && typeof album.coverPhoto === 'object' ? (
                <Image
                  src={album.coverPhoto.url || ''}
                  alt={album.coverPhoto.alt || album.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-white font-semibold truncate">{album.title}</h2>
                {album.date && (
                  <time className="text-white/70 text-sm">
                    {new Date(album.date).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                )}
                {album.photos && Array.isArray(album.photos) && (
                  <span className="text-white/70 text-sm ml-2">
                    {album.photos.length} photos
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No albums yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
