import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      supplier: true,
      items: { include: { product: true } },
      creator: true,
      attachments: true,
    },
  })
  if (!order) return NextResponse.json({ message: 'ไม่พบออเดอร์' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        status:     body.status,
        approvedBy: body.status === 'approved' ? 1 : undefined,
        approvedAt: body.status === 'approved' ? new Date() : undefined,
      },
    })
    return NextResponse.json(order)
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
    await prisma.order.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}