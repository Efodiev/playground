import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/approve - approve a playground
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    const playground = await db.playground.update({
      where: { id },
      data: { status: 'approved' },
    })
    return NextResponse.json(playground)
  } catch (error) {
    console.error('Error approving playground:', error)
    return NextResponse.json({ error: 'Failed to approve playground' }, { status: 500 })
  }
}
