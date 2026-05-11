import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendStockMovementAlert, sendLowStockAlert } from '@/lib/notify'

export async function GET() {
  const movements = await prisma.stockMovement.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(movements)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, referenceNo, note, items } = body

    // ใช้ user id = 1 ชั่วคราว
    const createdBy = 1

    const results = await prisma.$transaction(
      items.map((item: {
        productId: number
        receiveQty?: number
        issueQty?: number
        note?: string
      }) => {
        const qty = type === 'receive'
          ? (item.receiveQty ?? 0)
          : (item.issueQty ?? 0)

        const quantityChange = type === 'receive' ? qty : -qty

        return prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: quantityChange } },
        })
      })
    )

    // บันทึก stock movements
    const currentProducts = await prisma.product.findMany({
      where: { id: { in: items.map((i: { productId: number }) => i.productId) } },
    })

    await prisma.stockMovement.createMany({
      data: items.map((item: {
        productId: number
        receiveQty?: number
        issueQty?: number
        note?: string
      }) => {
        const qty = type === 'receive'
          ? (item.receiveQty ?? 0)
          : (item.issueQty ?? 0)

        const product = currentProducts.find((p) => p.id === item.productId)
        const quantityAfter = product?.quantity ?? 0
        const quantityBefore = type === 'receive'
          ? quantityAfter - qty
          : quantityAfter + qty

        return {
          productId:      item.productId,
          type,
          quantity:       qty,
          quantityBefore,
          quantityAfter,
          referenceNo:    referenceNo || null,
          note:           item.note || note || null,
          createdBy,
        }
      }),
    })
    
    // หลัง createMany stock movements สำเร็จ
    await sendStockMovementAlert(
      type as 'receive' | 'issue',
      items.map((item: { productId: number; receiveQty?: number; issueQty?: number }) => {
        const qty = type === 'receive' ? (item.receiveQty ?? 0) : (item.issueQty ?? 0)
        const product = currentProducts.find((p) => p.id === item.productId)
        return {
          name:     product?.name ?? 'unknown',
          quantity: qty,
          unit:     product?.unit ?? null,
        }
      })
    )

    // เช็คสต็อกใกล้หมดหลังเบิกออก
    if (type === 'issue') {
      const updatedProducts = await prisma.product.findMany({
        where: { id: { in: items.map((i: { productId: number }) => i.productId) } },
      })
      const newLowStock = updatedProducts.filter((p) => p.quantity <= p.minStock)
      if (newLowStock.length > 0) {
        await sendLowStockAlert(newLowStock.map((p) => ({
          name:     p.name,
          code:     p.code,
          quantity: p.quantity,
          minStock: p.minStock,
          unit:     p.unit,
        })))
      }
    }

    return NextResponse.json({ success: true, updated: results.length }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}