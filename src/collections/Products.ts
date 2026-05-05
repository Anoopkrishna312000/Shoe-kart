import type { CollectionConfig } from 'payload'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    defaultColumns: ['title', 'brand', 'price', 'stock', 'featured'],
    useAsTitle: 'title',
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
      index: true,
      admin: {
        description: 'Auto-generated from the title when left empty.',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (typeof value === 'string' && value.trim()) return slugify(value)
            if (typeof data?.title === 'string') return slugify(data.title)
            return value
          },
        ],
      },
    },
    {
      name: 'brand',
      type: 'text',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      required: true,
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      admin: {
        description: 'Optional higher price shown as a markdown price.',
      },
      min: 0,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'colorway',
      type: 'text',
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' },
        { label: 'Unisex', value: 'unisex' },
        { label: 'Kids', value: 'kids' },
      ],
    },
    {
      name: 'sizes',
      type: 'array',
      fields: [
        {
          name: 'size',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'stock',
      type: 'number',
      min: 0,
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'badge',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Sale', value: 'sale' },
        { label: 'Limited', value: 'limited' },
      ],
    },
    {
      name: 'releaseDate',
      type: 'date',
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}

export default Products
