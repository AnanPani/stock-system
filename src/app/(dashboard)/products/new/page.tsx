import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/ProductForm'

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">เพิ่มสินค้าใหม่</h1>
      <ProductForm categories={categories} suppliers={suppliers} />
    </div>
  )
}