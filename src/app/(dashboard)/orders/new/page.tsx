import { prisma } from '@/lib/prisma'
import OrderForm from '@/components/OrderForm'

export default async function NewOrderPage() {
  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { images: true },
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">สร้างออเดอร์ใหม่</h1>
      <OrderForm products={products} suppliers={suppliers} />
    </div>
  )
}