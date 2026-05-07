import { prisma } from '@/lib/prisma'
import { formatNumber } from '@/lib/utils'
import { Package, ShoppingCart, AlertTriangle, Clock } from 'lucide-react'

async function getDashboardData() {
  const [
    totalProducts,
    lowStockProducts,
    totalOrders,
    pendingOrders,
    recentOrders,
    recentMovements,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true, quantity: { lte: 10 } },
      take: 5,
      orderBy: { quantity: 'asc' },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true, supplier: true },
    }),
    prisma.stockMovement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    }),
  ])

  return {
    totalProducts,
    lowStockProducts,
    totalOrders,
    pendingOrders,
    recentOrders,
    recentMovements,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const stats = [
    { label: 'สินค้าทั้งหมด', value: formatNumber(data.totalProducts),           icon: Package,        color: 'bg-blue-500'   },
    { label: 'ออเดอร์ทั้งหมด', value: formatNumber(data.totalOrders),             icon: ShoppingCart,   color: 'bg-green-500'  },
    { label: 'รอดำเนินการ',    value: formatNumber(data.pendingOrders),            icon: Clock,          color: 'bg-yellow-500' },
    { label: 'สต็อกใกล้หมด',  value: formatNumber(data.lowStockProducts.length),  icon: AlertTriangle,  color: 'bg-red-500'    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            สินค้าใกล้หมด
          </h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">ไม่มีสินค้าใกล้หมด</p>
          ) : (
            <div className="space-y-3">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.code}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    เหลือ {product.quantity} {product.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-500" />
            ออเดอร์ล่าสุด
          </h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีออเดอร์</p>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{order.orderNo}</p>
                    <p className="text-xs text-gray-500">{order.supplier?.name ?? 'ภายใน'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                   'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'completed' ? 'เสร็จสิ้น' :
                     order.status === 'pending'   ? 'รอดำเนินการ' :
                     order.status === 'cancelled' ? 'ยกเลิก' :
                     order.status === 'draft'     ? 'ร่าง' : order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ความเคลื่อนไหวสต็อกล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">สินค้า</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">ประเภท</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">จำนวน</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">คงเหลือ</th>
              </tr>
            </thead>
            <tbody>
              {data.recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    ยังไม่มีความเคลื่อนไหว
                  </td>
                </tr>
              ) : (
                data.recentMovements.map((movement) => (
                  <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{movement.product.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        movement.type === 'receive'  ? 'bg-green-100 text-green-700' :
                        movement.type === 'issue'    ? 'bg-red-100 text-red-700' :
                        movement.type === 'adjust'   ? 'bg-blue-100 text-blue-700' :
                                                       'bg-gray-100 text-gray-700'
                      }`}>
                        {movement.type === 'receive'  ? 'รับเข้า' :
                         movement.type === 'issue'    ? 'เบิกออก' :
                         movement.type === 'adjust'   ? 'ปรับยอด' :
                         movement.type === 'transfer' ? 'โอน' : movement.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      <span className={movement.type === 'receive' ? 'text-green-600' : 'text-red-600'}>
                        {movement.type === 'receive' ? '+' : '-'}{formatNumber(movement.quantity)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatNumber(movement.quantityAfter)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}