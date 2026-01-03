import Link from 'next/link'

interface FooterProps {
  siteName?: string
  contactEmail?: string
}

export function Footer({ siteName = 'The 500 Companion', contactEmail }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-4">{siteName}</h3>
            <p className="text-sm">
              Your guide to The 500 property. Stay updated with the latest news, events, and photos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/updates" className="hover:text-primary-400 transition-colors">
                  Updates
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-primary-400 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-primary-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/visitor-guide" className="hover:text-primary-400 transition-colors">
                  Visitor Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <div className="text-sm space-y-2">
              {contactEmail && (
                <p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {contactEmail}
                  </a>
                </p>
              )}
              <Link href="/about" className="hover:text-primary-400 transition-colors block">
                About Us
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {currentYear} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
