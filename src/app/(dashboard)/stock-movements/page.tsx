import { prisma } from '@/lib/prisma'
import { formatNumber, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default async function StockMovementsPage() {
  const movements = await prisma.stockMovement.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">รับ/เบิกสินค้า</h1>
        <div className="flex gap-2">
          <Link
            href="/stock-movements/receive"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <ArrowDownCircle size={18} />
            รับสินค้าเข้า
          </Link>
          <Link
            href="/stock-movements/issue"
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            <ArrowUpCircle size={18} />
            เบิกสินค้าออก
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">สินค้า</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">ประเภท</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">จำนวน</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">ก่อน</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">หลัง</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">อ้างอิง</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">โดย</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  ยังไม่มีความเคลื่อนไหว
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{m.product.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      m.type === 'receive'  ? 'bg-green-100 text-green-700' :
                      m.type === 'issue'    ? 'bg-red-100 text-red-700' :
                      m.type === 'adjust'   ? 'bg-blue-100 text-blue-700' :
                                             'bg-gray-100 text-gray-600'
                    }`}>
                      {m.type === 'receive'  ? 'รับเข้า' :
                       m.type === 'issue'    ? 'เบิกออก' :
                       m.type === 'adjust'   ? 'ปรับยอด' :
                       m.type === 'transfer' ? 'โอน' : m.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={m.type === 'receive' ? 'text-green-600' : 'text-red-600'}>
                      {m.type === 'receive' ? '+' : '-'}{formatNumber(m.quantity)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500">{formatNumber(m.quantityBefore)}</td>
                  <td className="py-3 px-4 text-right text-gray-800 font-medium">{formatNumber(m.quantityAfter)}</td>
                  <td className="py-3 px-4 text-gray-500">{m.referenceNo ?? '-'}</td>
                  <td className="py-3 px-4 text-gray-500">{m.user?.fullName ?? '-'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(m.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}