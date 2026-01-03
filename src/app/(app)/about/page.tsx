import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPage, getSiteSettings } from '@/lib/payload'

export const metadata = {
  title: 'About | The 500 Companion',
  description: 'Learn about The 500 property',
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPage('about'), getSiteSettings()])

  // If no about page exists yet, show a placeholder
  if (!page) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-serif text-4xl font-bold mb-8">About The 500</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">
            Welcome to {settings?.siteName || 'The 500 Companion'}.
            This is your digital guide to The 500 property.
          </p>
          {settings?.description && (
            <p className="text-gray-600">{settings.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-8">
            <em>Content can be managed through the admin panel at /admin</em>
          </p>
        </div>
      </div>
    )
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-8">{page.title}</h1>

      {page.featuredImage && typeof page.featuredImage === 'object' && (
        <div className="aspect-video relative rounded-lg overflow-hidden mb-8">
          <Image
            src={page.featuredImage.url || ''}
            alt={page.featuredImage.alt || page.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {page.excerpt && (
        <p className="text-xl text-gray-600 mb-8">{page.excerpt}</p>
      )}

      <div className="prose prose-lg max-w-none">
        {/* RichText content would be rendered here */}
        {page.content && (
          <div
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(page.content, null, 2),
            }}
          />
        )}
      </div>

      {/* Contact Information */}
      {settings?.contactEmail && (
        <div className="mt-12 pt-8 border-t">
          <h2 className="font-semibold text-xl mb-4">Contact Us</h2>
          <p className="text-gray-600">
            <a
              href={`mailto:${settings.contactEmail}`}
              className="text-primary-600 hover:text-primary-700"
            >
              {settings.contactEmail}
            </a>
          </p>
        </div>
      )}
    </article>
  )
}
