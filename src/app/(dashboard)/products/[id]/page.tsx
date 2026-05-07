import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import ProductEditForm from '@/components/ProductEditForm'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true, supplier: true, images: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/products" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">รูปภาพสินค้า</h2>
          {product.images.length === 0 ? (
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
              ไม่มีรูปภาพ
            </div>
          ) : (
            <div className="space-y-3">
              {/* Primary Image */}
              {(() => {
                const primary = product.images.find((img) => img.isPrimary) ?? product.images[0]
                return (
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image src={primary.url} alt={product.name} fill className="object-cover" />
                  </div>
                )
              })()}
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img) => (
                    <div key={img.id} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${img.isPrimary ? 'border-blue-500' : 'border-transparent'}`}>
                      <Image src={img.url} alt={product.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stock Info */}
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-700">ข้อมูลสต็อก</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">คงเหลือ</span>
                <span className={`font-bold text-lg ${product.quantity <= product.minStock ? 'text-red-600' : 'text-green-600'}`}>
                  {product.quantity} {product.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สต็อกขั้นต่ำ</span>
                <span className="font-medium text-gray-800">{product.minStock} {product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สต็อกสูงสุด</span>
                <span className="font-medium text-gray-800">{product.maxStock} {product.unit}</span>
              </div>
              {product.location && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ตำแหน่งในคลัง</span>
                  <span className="font-medium text-gray-800">{product.location}</span>
                </div>
              )}
            </div>
            {product.quantity <= product.minStock && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                ⚠️ สต็อกต่ำกว่าขั้นต่ำ กรุณาสั่งซื้อเพิ่ม
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <ProductEditForm
            product={product}
            categories={categories}
            suppliers={suppliers}
          />
        </div>
      </div>
    </div>
  )
}