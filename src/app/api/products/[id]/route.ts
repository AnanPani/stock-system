import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true, supplier: true },
  })
  if (!product) return NextResponse.json({ message: 'ไม่พบสินค้า' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        code:        body.code,
        name:        body.name,
        description: body.description || null,
        categoryId:  body.categoryId  ? Number(body.categoryId)  : null,
        supplierId:  body.supplierId  ? Number(body.supplierId)  : null,
        unit:        body.unit        || null,
        priceBuy:    Number(body.priceBuy  ?? 0),
        priceSell:   Number(body.priceSell ?? 0),
        minStock:    Number(body.minStock  ?? 10),
        maxStock:    Number(body.maxStock  ?? 1000),  // ← เพิ่มตรงนี้
        location:    body.location    || null,
        isActive:    body.isActive ?? true,
      },
    })
    return NextResponse.json(product)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}