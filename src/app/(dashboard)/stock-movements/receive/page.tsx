import { prisma } from '@/lib/prisma'
import StockReceiveForm from '@/components/StockReceiveForm'

export default async function ReceivePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">รับสินค้าเข้าคลัง</h1>
      <StockReceiveForm products={products} />
    </div>
  )
}