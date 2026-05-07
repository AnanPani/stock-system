import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, supplier: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const product = await prisma.product.create({
      data: {
        code:        body.code,
        name:        body.name,
        description: body.description || null,
        categoryId:  body.categoryId  ? Number(body.categoryId)  : null,
        supplierId:  body.supplierId  ? Number(body.supplierId)  : null,
        unit:        body.unit        || null,
        priceBuy:    Number(body.priceBuy  ?? 0),
        priceSell:   Number(body.priceSell ?? 0),
        quantity:    Number(body.quantity  ?? 0),
        minStock:    Number(body.minStock  ?? 10),
        location:    body.location    || null,
        images: {
          create: (body.images ?? []).map((img: { url: string; isPrimary: boolean }) => ({
            url:       img.url,
            isPrimary: img.isPrimary,
          })),
        },
      },
      include: { images: true },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}