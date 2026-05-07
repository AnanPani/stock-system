import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateOrderNo(type: string) {
  const prefix = type === 'purchase' ? 'PO' : type === 'sale' ? 'SO' : 'IN'
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.floor(Math.random() * 9000) + 1000
  return `${prefix}-${dateStr}-${random}`
}

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      supplier: true,
      items: { include: { product: true } },
      creator: true,
      attachments: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ใช้ user id = 1 ชั่วคราว (จะเปลี่ยนเมื่อทำ auth)
    const createdBy = 1

    const order = await prisma.order.create({
      data: {
        orderNo:     generateOrderNo(body.type),
        type:        body.type       ?? 'purchase',
        status:      'draft',
        supplierId:  body.supplierId ?? null,
        note:        body.note       || null,
        totalAmount: Number(body.totalAmount ?? 0),
        createdBy,
        items: {
          create: body.items.map((item: {
            productId: number
            quantity: number
            unitPrice: number
            note?: string
          }) => ({
            productId: item.productId,
            quantity:  item.quantity,
            unitPrice: item.unitPrice,
            note:      item.note || null,
          })),
        },
        attachments: body.attachment
          ? { create: [{ url: body.attachment }] }
          : undefined,
      },
      include: {
        items: true,
        attachments: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}