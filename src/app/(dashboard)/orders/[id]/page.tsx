import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package } from 'lucide-react'
import OrderStatusActions from '@/components/OrderStatusActions'

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      supplier: true,
      creator: true,
      approver: true,
      attachments: true,
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  })

  if (!order) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{order.orderNo}</h1>
            <p className="text-sm text-gray-500">
              {order.type === 'purchase' ? 'ใบสั่งซื้อ (PO)' :
               order.type === 'sale'     ? 'ใบขาย (SO)' : 'เบิกภายใน'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColor[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {statusLabel[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-500" />
              รายการสินค้า
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">สินค้า</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-medium">จำนวน</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">ราคา/หน่วย</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">รวม</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const primaryImg = item.product.images.find((img) => img.isPrimary) ?? item.product.images[0]
                  return (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {primaryImg ? (
                              <Image
                                src={primaryImg.url}
                                alt={item.product.name}
                                width={40} height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">ไม่มีรูป</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.product.name}</p>
                            <p className="text-xs text-gray-400">{item.product.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.quantity} {item.product.unit}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(Number(item.unitPrice))}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(Number(item.totalPrice))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="py-3 px-4 text-right font-semibold text-gray-700">
                    ยอดรวมทั้งหมด
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-600 text-base">
                    {formatCurrency(Number(order.totalAmount))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Attachment */}
          {order.attachments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">เอกสารแนบ</h2>
              <div className="flex gap-3">
                {order.attachments.map((att) => (
                  <div key={att.id} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={att.url}
                      alt="เอกสารแนบ"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">

          {/* Order Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลออเดอร์</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">เลขที่</span>
                <span className="font-medium text-gray-800">{order.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ประเภท</span>
                <span className="font-medium text-gray-800">
                  {order.type === 'purchase' ? 'สั่งซื้อเข้า' :
                   order.type === 'sale'     ? 'ขายออก' : 'เบิกภายใน'}
                </span>
              </div>
              {order.supplier && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ผู้จำหน่าย</span>
                  <span className="font-medium text-gray-800">{order.supplier.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">สร้างโดย</span>
                <span className="font-medium text-gray-800">{order.creator.fullName ?? order.creator.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">วันที่สร้าง</span>
                <span className="font-medium text-gray-800">{formatDate(order.createdAt)}</span>
              </div>
              {order.approver && (
                <div className="flex justify-between">
                  <span className="text-gray-500">อนุมัติโดย</span>
                  <span className="font-medium text-gray-800">{order.approver.fullName ?? order.approver.username}</span>
                </div>
              )}
              {order.note && (
                <div>
                  <span className="text-gray-500">หมายเหตุ</span>
                  <p className="mt-1 text-gray-800 bg-gray-50 p-2 rounded-lg">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <OrderStatusActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </div>
  )
}