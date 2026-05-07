import { prisma } from '@/lib/prisma'
import { formatNumber, formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const [
    totalProducts,
    totalStock,
    lowStock,
    totalOrders,
    completedOrders,
    topProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.aggregate({ _sum: { quantity: true } }),
    prisma.product.count({ where: { isActive: true, quantity: { lte: 10 } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'completed' } }),
    prisma.product.findMany({
      orderBy: { quantity: 'desc' },
      take: 10,
      where: { isActive: true },
      include: { category: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">รายงาน</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'สินค้าทั้งหมด',   value: formatNumber(totalProducts),                        color: 'text-blue-600'  },
          { label: 'จำนวนสต็อกรวม',   value: formatNumber(totalStock._sum.quantity ?? 0),         color: 'text-green-600' },
          { label: 'สินค้าใกล้หมด',   value: formatNumber(lowStock),                             color: 'text-red-600'   },
          { label: 'ออเดอร์สำเร็จ',   value: `${completedOrders}/${totalOrders}`,                color: 'text-purple-600'},
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Top Stock Products */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">สินค้าที่มีสต็อกมากที่สุด</h2>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center gap-4">
              <span className="w-6 text-center text-sm font-bold text-gray-400">{index + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{product.name}</span>
                  <span className="text-sm text-gray-500">{formatNumber(product.quantity)} {product.unit}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((product.quantity / (topProducts[0]?.quantity || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}