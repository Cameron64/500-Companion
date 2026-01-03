import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Updates } from './collections/Updates'
import { Events } from './collections/Events'
import { Pages } from './collections/Pages'
import { Albums } from './collections/Albums'
import { Media } from './collections/Media'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - The 500 Companion',
    },
  },
  collections: [Users, Updates, Events, Pages, Albums, Media],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || 'development-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5434/500companion',
    },
  }),
  editor: lexicalEditor(),
  sharp,
})
