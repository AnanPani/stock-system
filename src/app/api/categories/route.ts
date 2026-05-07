import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const category = await prisma.category.create({
      data: { name: body.name, description: body.description || null },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}