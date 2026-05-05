import 'dotenv/config'

import { MongoClient, ObjectId } from 'mongodb'

const now = new Date().toISOString()
const client = new MongoClient(process.env.DATABASE_URL)

const withIds = (sizes) => sizes.map((size) => ({ id: new ObjectId().toHexString(), size }))

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

await client.connect()

const db = client.db()
const productsCollection = db.collection('products')
const categoriesCollection = db.collection('categories')
const mediaCollection = db.collection('media')

const categoryNames = [
  'Shoes',
  'Air Jordan',
  'Nike',
  'Puma',
  'Adidas',
  'New Balance',
  'Converse',
  'Asics',
  'Onitsuka Tiger',
  'Trail Running',
]

const categories = {}

for (const name of categoryNames) {
  const existing = await categoriesCollection.findOne({ name })

  if (existing) {
    categories[name] = existing._id
  } else {
    const _id = new ObjectId().toHexString()

    await categoriesCollection.insertOne({
      _id,
      __v: 0,
      createdAt: now,
      name,
      updatedAt: now,
    })

    categories[name] = _id
  }
}

const mediaByFile = {}

for (const media of await mediaCollection.find({}).toArray()) {
  mediaByFile[media.filename] = media._id
}

const sizeRun = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']

const existingUpdates = [
  {
    badge: 'limited',
    brand: 'Air Jordan',
    category: categories['Air Jordan'],
    colorway: 'Black / Red',
    featured: true,
    gender: 'unisex',
    slug: 'air-jordan-retro-rolling-stone',
    title: 'Air Jordan',
  },
  {
    badge: 'new',
    brand: 'Puma',
    category: categories.Puma,
    colorway: 'White / Green',
    featured: false,
    gender: 'unisex',
    slug: 'puma-palermo-vintage',
    title: 'Puma Palermo',
  },
  {
    badge: 'new',
    brand: 'Nike',
    category: categories.Nike,
    colorway: 'Custom',
    featured: false,
    gender: 'unisex',
    slug: 'nike-air-max-90-by-you',
    title: 'Nike Air Max',
  },
  {
    badge: 'sale',
    brand: 'Puma',
    category: categories.Puma,
    colorway: 'Black / White',
    featured: false,
    gender: 'men',
    slug: 'puma-one8-training',
    title: 'Puma One 8',
  },
  {
    badge: 'new',
    brand: 'Adidas',
    category: categories.Adidas,
    colorway: 'Cloud White / Black',
    featured: false,
    gender: 'unisex',
    slug: 'adidas-samba-og',
    title: 'Adidas samba',
  },
  {
    badge: 'new',
    brand: 'Asics',
    category: categories.Asics,
    colorway: 'White / Black',
    featured: false,
    gender: 'unisex',
    slug: 'asics-gel-nyc-white-black',
    title: 'Asics',
  },
  {
    badge: 'limited',
    brand: 'Salomon',
    category: categories['Trail Running'],
    colorway: 'Black / Silver',
    featured: false,
    gender: 'unisex',
    slug: 'salomon-xt-6-gore-tex',
    title: 'Salmon Xt',
  },
  {
    badge: 'new',
    brand: 'Converse',
    category: categories.Converse,
    colorway: 'Black / White',
    featured: false,
    gender: 'unisex',
    slug: 'converse-chuck-70-high',
    title: 'Converse All Star',
  },
  {
    badge: 'limited',
    brand: 'New Balance',
    category: categories['New Balance'],
    colorway: 'Grey / Energy Red',
    featured: false,
    gender: 'unisex',
    slug: 'new-balance-fuelcell-supercomp',
    title: 'New Balance',
  },
  {
    badge: 'new',
    brand: 'Onitsuka Tiger',
    category: categories['Onitsuka Tiger'],
    colorway: 'Yellow / Black',
    featured: false,
    gender: 'unisex',
    slug: 'onitsuka-tiger-mexico-66-yellow',
    title: 'Onitsuka tiger',
  },
]

for (const product of existingUpdates) {
  await productsCollection.updateOne(
    { title: product.title },
    {
      $set: {
        ...product,
        sizes: withIds(sizeRun),
        updatedAt: now,
      },
    },
  )
}

const newProducts = [
  {
    badge: 'new',
    brand: 'Nike',
    category: categories.Nike,
    colorway: 'Triple Black',
    description: 'Crisp street runner with custom Air Max comfort.',
    featured: false,
    gender: 'unisex',
    image: mediaByFile['custom-nike-air-max-90-shoes-by-you.avif'],
    price: 9495,
    stock: 18,
    title: 'Nike Air Max 90 Triple Black',
  },
  {
    badge: 'sale',
    brand: 'Puma',
    category: categories.Puma,
    colorway: 'White / Black',
    description: 'Lightweight trainer built for gym sessions and daily rotation.',
    featured: false,
    gender: 'men',
    image: mediaByFile["PUMA-x-Jaab-XT-one8-Men's-Training-Shoe.avif"],
    price: 6499,
    stock: 22,
    title: 'Puma One8 Training White',
  },
  {
    badge: 'limited',
    brand: 'Onitsuka Tiger',
    category: categories['Onitsuka Tiger'],
    colorway: 'Birch / Peacoat',
    description: 'Retro low-profile sneaker with a clean heritage shape.',
    featured: false,
    gender: 'unisex',
    image: mediaByFile['Tiger shoes.jpg'],
    price: 7999,
    stock: 14,
    title: 'Onitsuka Tiger Mexico 66 Birch',
  },
  {
    badge: 'limited',
    brand: 'Air Jordan',
    category: categories['Air Jordan'],
    colorway: 'White / Red',
    description: 'Premium Jordan silhouette with a bold editorial finish.',
    featured: false,
    gender: 'unisex',
    image: mediaByFile['Air-Jordan-Nike-Rolling-Stone-4.webp'],
    price: 11999,
    stock: 9,
    title: 'Air Jordan Retro Rolling Stone',
  },
  {
    badge: 'new',
    brand: 'Puma',
    category: categories.Puma,
    colorway: 'Green / Gum',
    description: 'Terrace classic with soft suede energy and gum sole styling.',
    featured: false,
    gender: 'unisex',
    image: mediaByFile['puma__palermo.webp'],
    price: 6999,
    stock: 19,
    title: 'Puma Palermo Green Gum',
  },
]

let inserted = 0

for (const product of newProducts) {
  const slug = slugify(product.title)
  const existing = await productsCollection.findOne({ slug })

  if (existing) continue

  await productsCollection.insertOne({
    _id: new ObjectId().toHexString(),
    __v: 0,
    ...product,
    createdAt: now,
    images: product.image ? [{ id: new ObjectId().toHexString(), image: product.image }] : [],
    sizes: withIds(sizeRun),
    slug,
    updatedAt: now,
  })

  inserted += 1
}

const totalProducts = await productsCollection.countDocuments({})

console.log(
  JSON.stringify(
    {
      categories: categoryNames,
      inserted,
      totalProducts,
    },
    null,
    2,
  ),
)

await client.close()
