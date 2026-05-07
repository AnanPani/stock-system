import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const statusLabel: Record<string, string> = {
  draft:      'ร่าง',
  pending:    'รอดำเนินการ',
  approved:   'อนุมัติแล้ว',
  processing: 'กำลังดำเนินการ',
  completed:  'เสร็จสิ้น',
  cancelled:  'ยกเลิก',
}

const statusColor: Record<string, string> = {
  draft:      'bg-gray-100 text-gray-600',
  pending:    'bg-yellow-100 text-yellow-700',
  approved:   'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { supplier: true, items: true, creator: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">ออเดอร์ทั้งหมด</h1>
        <Link
          href="/orders/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={18} />
          สร้างออเดอร์
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">เลขที่</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">ประเภท</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">ผู้จำหน่าย</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">มูลค่า</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">สถานะ</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">วันที่</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  ยังไม่มีออเดอร์
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-medium text-blue-600">{order.orderNo}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {order.type === 'purchase' ? 'สั่งซื้อ' :
                     order.type === 'sale'     ? 'ขาย' : 'ภายใน'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{order.supplier?.name ?? '-'}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(Number(order.totalAmount))}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline text-xs">
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}