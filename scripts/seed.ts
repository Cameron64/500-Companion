import { getPayload } from 'payload'
import config from '../src/payload.config'

async function seed() {
  console.log('Starting seed...')

  const payload = await getPayload({ config })

  // Check if admin user exists
  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      role: { equals: 'admin' },
    },
    limit: 1,
  })

  if (existingUsers.docs.length === 0) {
    console.log('Creating admin user...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@the500companion.com',
        password: 'CHANGE_ME_ON_FIRST_LOGIN',
        role: 'admin',
        name: 'Admin',
      },
    })
    console.log('Admin user created. Email: admin@the500companion.com')
    console.log('IMPORTANT: Change the password on first login!')
  } else {
    console.log('Admin user already exists, skipping...')
  }

  // Update site settings
  console.log('Updating site settings...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'The 500 Companion',
      tagline: 'Your Guide to The 500',
      description: 'Share updates and visitor information for The 500 property.',
    },
  })

  // Check if visitor guide page exists
  const existingVisitorGuide = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'visitor-guide' },
    },
    limit: 1,
  })

  if (existingVisitorGuide.docs.length === 0) {
    console.log('Creating visitor guide page...')
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Visitor Guide',
        slug: 'visitor-guide',
        content: {
          root: {
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Welcome! Add your visitor guide content here.' }],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        offlineAvailable: true,
        showInNav: true,
        navOrder: 1,
        status: 'published',
      },
    })
    console.log('Visitor guide page created.')
  }

  // Check if about page exists
  const existingAbout = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'about' },
    },
    limit: 1,
  })

  if (existingAbout.docs.length === 0) {
    console.log('Creating about page...')
    await payload.create({
      collection: 'pages',
      data: {
        title: 'About',
        slug: 'about',
        content: {
          root: {
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Learn about The 500 property and its history.' }],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        showInNav: true,
        navOrder: 5,
        status: 'published',
      },
    })
    console.log('About page created.')
  }

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
