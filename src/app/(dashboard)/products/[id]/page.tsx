import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductEditForm from '@/components/ProductEditForm'
import ProductImageGallery from '@/components/ProductImageGallery'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [raw, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true, supplier: true, images: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  if (!raw) notFound()

  const product = {
    ...raw,
    priceBuy:  Number(raw.priceBuy),
    priceSell: Number(raw.priceSell),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    images: raw.images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    })),
  }

  const stockPercent = Math.min(
    Math.round((product.quantity / product.maxStock) * 100),
    100
  )

  const stockColor =
    product.quantity <= product.minStock
      ? 'bg-red-500'
      : product.quantity <= product.minStock * 2
      ? 'bg-yellow-500'
      : 'bg-green-500'

  const profit = product.priceSell - product.priceBuy

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">

          {/* Image Gallery */}
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />

          {/* Stock Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">ข้อมูลสต็อก</h3>

            {/* Stock Level Bar */}
            <div className="mb-5">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs text-gray-400">ระดับสต็อก</span>
                <span className="text-xs font-medium text-gray-500">
                  {stockPercent}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stockColor}`}
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
            </div>

            {/* คงเหลือ highlight */}
            <div className={`rounded-xl p-4 mb-4 text-center ${
              product.quantity <= product.minStock
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className="text-xs text-gray-500 mb-1">คงเหลือปัจจุบัน</p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className={`text-4xl font-bold ${
                  product.quantity <= product.minStock
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {product.quantity.toLocaleString('th-TH')}
                </span>
              </div>
            </div>

            {/* Min / Max */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">ขั้นต่ำ</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl font-bold text-gray-700">
                    {product.minStock.toLocaleString('th-TH')}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">สูงสุด</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl font-bold text-gray-700">
                    {product.maxStock.toLocaleString('th-TH')}
                  </span>
                </div>
              </div>
            </div>

            {/* สต็อก fraction */}
            <div className="flex items-center justify-center gap-2 text-sm mb-4">
              <span className={`text-2xl font-bold ${
                product.quantity <= product.minStock
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}>
                {product.quantity.toLocaleString('th-TH')}
              </span>
              <span className="text-gray-300 text-2xl font-light">/</span>
              <span className="text-2xl font-bold text-gray-400">
                {product.maxStock.toLocaleString('th-TH')}
              </span>
            </div>

            {/* ราคา */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">ราคาทุน</span>
                <span className="font-medium text-gray-700">
                  ฿{product.priceBuy.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">ราคาขาย</span>
                <span className="font-medium text-green-600">
                  ฿{product.priceSell.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-2.5">
                <span className="text-gray-500">กำไร / หน่วย</span>
                <span className={`font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {profit >= 0 ? '+' : ''}฿{profit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* ตำแหน่งคลัง */}
            {product.location && (
              <div className="border-t border-gray-100 pt-3 mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">ตำแหน่งในคลัง</span>
                <span className="font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg text-xs tracking-wide">
                  📍 {product.location}
                </span>
              </div>
            )}

            {/* Warning */}
            {product.quantity <= product.minStock && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <span>⚠️</span>
                  <span>สต็อกต่ำกว่าขั้นต่ำ!</span>
                </div>
                <p className="text-xs text-red-400 pl-6">
                  ขาดอีก{' '}
                  <span className="font-bold text-red-600">
                    {(product.minStock - product.quantity).toLocaleString('th-TH')}
                  </span>{' '}
                  {product.unit} ถึงจะถึงขั้นต่ำ
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Edit Form */}
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