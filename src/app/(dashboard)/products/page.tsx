import { prisma } from '@/lib/prisma'
import { formatNumber, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import ProductsTable from '@/components/ProductsTable'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      supplier: true,
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = products.map((p) => ({
    ...p,
    priceBuy:  Number(p.priceBuy),
    priceSell: Number(p.priceSell),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    images: p.images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    })),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">สินค้าทั้งหมด</h1>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          เพิ่มสินค้า
        </Link>
      </div>
      <ProductsTable products={serialized} />
    </div>
  )
}