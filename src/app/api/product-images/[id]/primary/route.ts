import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const imageId = Number(id)

    // หา productId ของรูปนี้
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    })

    if (!image) {
      return NextResponse.json({ message: 'ไม่พบรูปภาพ' }, { status: 404 })
    }

    // ยกเลิก primary ของรูปเดิมทั้งหมด
    await prisma.productImage.updateMany({
      where: { productId: image.productId },
      data:  { isPrimary: false },
    })

    // ตั้ง primary ใหม่
    await prisma.productImage.update({
      where: { id: imageId },
      data:  { isPrimary: true },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}