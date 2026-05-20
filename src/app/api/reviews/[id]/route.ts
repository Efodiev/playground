import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/reviews/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const review = await db.review.findUnique({ where: { id } })
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await db.review.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
