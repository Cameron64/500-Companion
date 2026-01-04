import { getPage } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Visitor Guide | The 500 Companion',
  description: 'Everything you need to know for visiting The 500',
}

export default async function VisitorGuidePage() {
  const page = await getPage('visitor-guide')

  // If no visitor guide page exists yet, show a placeholder
  if (!page) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-8">Visitor Guide</h1>
        <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
          <p className="text-gray-600">
            The visitor guide is coming soon. Check back later for information about:
          </p>
          <ul className="text-gray-600">
            <li>Getting Here</li>
            <li>Property Rules</li>
            <li>What to Bring</li>
            <li>Safety Guidelines</li>
            <li>Map & Directions</li>
          </ul>
          <p className="text-gray-500 text-sm mt-8">
            <em>Content can be managed through the admin panel at /admin</em>
          </p>
        </div>
      </div>
    )
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-8">{page.title}</h1>
      {page.excerpt && (
        <p className="text-xl text-gray-600 mb-8">{page.excerpt}</p>
      )}
      <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
        {/* RichText content would be rendered here */}
        {page.content && (
          <div
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(page.content, null, 2),
            }}
          />
        )}
      </div>
    </article>
  )
}
