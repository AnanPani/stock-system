import { prisma } from '@/lib/prisma'
import StockIssueForm from '@/components/StockIssueForm'

export default async function IssuePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">เบิกสินค้าออกจากคลัง</h1>
      <StockIssueForm products={products} />
    </div>
  )
}