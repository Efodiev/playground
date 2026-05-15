import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/reject - reject/delete a playground
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await db.playground.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting playground:', error)
    return NextResponse.json({ error: 'Failed to reject playground' }, { status: 500 })
  }
}
