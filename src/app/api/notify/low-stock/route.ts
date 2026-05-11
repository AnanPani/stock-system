import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendLowStockAlert } from '@/lib/notify'

const CRON_SECRET = process.env.CRON_SECRET ?? 'stock-cron-secret-change-this'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { quantity: 'asc' },
    })

    const lowStock = products.filter((p) => p.quantity <= p.minStock)

    if (lowStock.length === 0) {
      return NextResponse.json({ message: 'ไม่มีสินค้าใกล้หมด', count: 0 })
    }

    await sendLowStockAlert(
      lowStock.map((p) => ({
        name:     p.name,
        code:     p.code,
        quantity: p.quantity,
        minStock: p.minStock,
        unit:     p.unit,
      }))
    )

    return NextResponse.json({
      message:  'ส่งแจ้งเตือนไปที่ Discord แล้ว',
      count:    lowStock.length,
      products: lowStock.map((p) => ({
        name:     p.name,
        quantity: p.quantity,
        minStock: p.minStock,
      })),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { quantity: 'asc' },
  })

  const lowStock = products.filter((p) => p.quantity <= p.minStock)

  return NextResponse.json({
    count: lowStock.length,
    products: lowStock.map((p) => ({
      id:       p.id,
      name:     p.name,
      code:     p.code,
      quantity: p.quantity,
      minStock: p.minStock,
      unit:     p.unit,
    })),
  })
}