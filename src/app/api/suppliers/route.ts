import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supplier = await prisma.supplier.create({
      data: {
        code:        body.code,
        name:        body.name,
        contactName: body.contactName || null,
        phone:       body.phone       || null,
        email:       body.email       || null,
        address:     body.address     || null,
      },
    })
    return NextResponse.json(supplier, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}