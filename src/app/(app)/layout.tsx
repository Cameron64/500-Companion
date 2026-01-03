import type { Metadata, Viewport } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { Navigation } from '@/components/ui/Navigation'
import { Footer } from '@/components/ui/Footer'
import { getSiteSettings } from '@/lib/payload'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-merriweather',
})

export const viewport: Viewport = {
  themeColor: '#10b981',
}

export const metadata: Metadata = {
  title: 'The 500 Companion',
  description: 'Your guide to The 500',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The 500',
  },
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Navigation siteName={settings?.siteName || 'The 500 Companion'} />
          <main className="flex-grow">{children}</main>
          <Footer
            siteName={settings?.siteName || 'The 500 Companion'}
            contactEmail={settings?.contactEmail || undefined}
          />
        </div>
      </body>
    </html>
  )
}
