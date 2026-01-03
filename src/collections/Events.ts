import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'eventType', 'status'],
    preview: (doc) => {
      if (doc?.slug) {
        return `/events/${doc.slug}`
      }
      return null
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user?.role === 'friend') {
        return {
          status: { equals: 'published' },
          eventType: { in: ['public', 'friends-only'] },
        }
      }
      // Public
      return {
        status: { equals: 'published' },
        eventType: { equals: 'public' },
      }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          displayFormat: 'MMM d, yyyy h:mm a',
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'MMM d, yyyy h:mm a',
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'allDay',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'eventType',
      type: 'select',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Friends Only', value: 'friends-only' },
        { label: 'Private', value: 'private' },
      ],
      defaultValue: 'public',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'maxAttendees',
      type: 'number',
      min: 0,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'recurrence',
      type: 'group',
      admin: {
        description: 'V2 Feature: Recurring events configuration',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'frequency',
          type: 'select',
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'interval',
          type: 'number',
          defaultValue: 1,
          min: 1,
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
  ],
}
