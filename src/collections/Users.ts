import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Allow creating first user when no users exist, otherwise require admin
    create: async ({ req }) => {
      // If no user is logged in, check if this is the first user
      if (!req.user) {
        const users = await req.payload.find({
          collection: 'users',
          limit: 1,
        })
        // Allow if no users exist (first user creation)
        return users.totalDocs === 0
      }
      return req.user.role === 'admin'
    },
    read: ({ req }) => !!req.user,
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Friend', value: 'friend' },
      ],
      defaultValue: 'friend',
      required: true,
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
