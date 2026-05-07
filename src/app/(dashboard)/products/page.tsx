import { prisma } from '@/lib/prisma'
import { formatNumber, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, supplier: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">สินค้าทั้งหมด</h1>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          เพิ่มสินค้า
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">รหัส</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">ชื่อสินค้า</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">หมวดหมู่</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">คงเหลือ</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">ราคาขาย</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">สถานะ</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <Package size={40} className="mx-auto mb-2 opacity-30" />
                  ยังไม่มีสินค้า
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-gray-500">{product.code}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{product.name}</td>
                  <td className="py-3 px-4 text-gray-500">{product.category?.name ?? '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={product.quantity <= product.minStock
                      ? 'text-red-600 font-bold'
                      : 'text-gray-800'
                    }>
                      {formatNumber(product.quantity)} {product.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-800">
                    {formatCurrency(Number(product.priceSell))}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.isActive ? 'ใช้งาน' : 'ปิดใช้'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      แก้ไข
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