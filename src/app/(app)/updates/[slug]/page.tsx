import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getUpdate } from '@/lib/payload'
import type { Metadata } from 'next'

interface UpdatePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: UpdatePageProps): Promise<Metadata> {
  const { slug } = await params
  const update = await getUpdate(slug)

  if (!update) {
    return {
      title: 'Update Not Found | The 500 Companion',
    }
  }

  return {
    title: `${update.title} | The 500 Companion`,
    description: update.excerpt || undefined,
  }
}

export default async function UpdatePage({ params }: UpdatePageProps) {
  const { slug } = await params
  const update = await getUpdate(slug)

  if (!update) {
    notFound()
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <Link
        href="/updates"
        className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        &larr; Back to Updates
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-4">{update.title}</h1>
        {update.publishedAt && (
          <time className="text-gray-500">
            {new Date(update.publishedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        )}
      </header>

      {update.featuredImage && typeof update.featuredImage === 'object' && (
        <div className="aspect-video relative rounded-lg overflow-hidden mb-8">
          <Image
            src={update.featuredImage.url || ''}
            alt={update.featuredImage.alt || update.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {/* RichText content would be rendered here */}
        {update.content && (
          <div
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(update.content, null, 2),
            }}
          />
        )}
      </div>

      {update.tags && update.tags.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {update.tags.map((tagItem, index) => (
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
    </article>
  )
}
