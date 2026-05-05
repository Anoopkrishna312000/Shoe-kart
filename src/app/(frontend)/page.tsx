import config from '@payload-config'
import { getPayload } from 'payload'

import type { Category, Media, Product } from '@/payload-types'

import { StorefrontClient, type StorefrontProduct } from './shared/StorefrontClient'

export const dynamic = 'force-dynamic'

type StoreData = {
  categories: Category[]
  products: Product[]
}

async function getStoreData(): Promise<StoreData> {
  try {
    const payload = await getPayload({ config })
    const [products, categories] = await Promise.all([
      payload.find({
        collection: 'products',
        depth: 1,
        limit: 50,
        sort: '-updatedAt',
      }),
      payload.find({
        collection: 'categories',
        limit: 50,
        sort: 'name',
      }),
    ])

    const sortedProducts = [...products.docs].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt).getTime()

      return dateB - dateA
    })

    return {
      categories: categories.docs,
      products: sortedProducts,
    }
  } catch (error) {
    console.warn('Unable to load Payload storefront data.', error)
    return {
      categories: [],
      products: [],
    }
  }
}

const getProductImage = (product: Product) => {
  const image = product.images?.[0]?.image
  return typeof image === 'object' && image ? (image as Media).url : undefined
}

const getProductMeta = (product: Product) => {
  if (product.brand) return product.brand
  if (product.category && typeof product.category === 'object') return product.category.name
  if (product.colorway) return product.colorway
  return 'Premium Sneakers'
}

const getProductCategory = (product: Product) => {
  if (product.category && typeof product.category === 'object') return product.category.name
  return product.brand || null
}

const toStorefrontProduct = (product: Product): StorefrontProduct => ({
  badge: product.badge,
  brand: product.brand,
  category: getProductCategory(product),
  colorway: product.colorway,
  id: product.id,
  imageUrl: getProductImage(product),
  meta: getProductMeta(product),
  price: product.price,
  stock: product.stock,
  title: product.title,
})

export default async function Home() {
  const { products } = await getStoreData()
  const featuredProduct = products.find((product) => product.featured) || products[0]
  const navItems = Array.from(new Set(products.map(getProductCategory).filter((item): item is string => Boolean(item))))

  return (
    <StorefrontClient
      featuredImageUrl={featuredProduct ? getProductImage(featuredProduct) : null}
      featuredTitle={featuredProduct ? featuredProduct.title : 'Create your first sneaker drop in Payload'}
      navItems={navItems}
      products={products.map(toStorefrontProduct)}
    />
  )
}
