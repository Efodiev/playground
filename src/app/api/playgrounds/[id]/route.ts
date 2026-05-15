import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/playgrounds/[id] - get a single playground
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const playground = await db.playground.findUnique({ where: { id } })
    if (!playground) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(playground)
  } catch (error) {
    console.error('Error fetching playground:', error)
    return NextResponse.json({ error: 'Failed to fetch playground' }, { status: 500 })
  }
}

// DELETE /api/playgrounds/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.playground.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playground:', error)
    return NextResponse.json({ error: 'Failed to delete playground' }, { status: 500 })
  }
}

// PATCH /api/playgrounds/[id] - update a playground
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const playground = await db.playground.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(playground)
  } catch (error) {
    console.error('Error updating playground:', error)
    return NextResponse.json({ error: 'Failed to update playground' }, { status: 500 })
  }
}
