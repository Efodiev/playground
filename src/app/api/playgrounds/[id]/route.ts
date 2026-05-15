import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Rating calculation (mirrors seed route)
const CONDITION_SCORES: Record<string, number> = {
  excellent: 40,
  good: 28,
  needs_repair: 12,
  dangerous: 0,
}

function calcRating(condition: string, equipmentStr: string): number {
  let equip: string[] = []
  try {
    equip = JSON.parse(equipmentStr || '[]')
  } catch {
    /* ignore parse errors */
  }
  const condScore = CONDITION_SCORES[condition] || 0
  const equipScore = Math.min(equip.length * 4, 60)
  return Math.min(condScore + equipScore, 100)
}

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

    // Convert lat/lng to floats if provided
    if (body.lat != null) body.lat = parseFloat(String(body.lat))
    if (body.lng != null) body.lng = parseFloat(String(body.lng))

    // Serialize array fields to JSON strings if they are arrays
    if (Array.isArray(body.equipment)) {
      body.equipment = JSON.stringify(body.equipment)
    }
    if (Array.isArray(body.photos)) {
      body.photos = JSON.stringify(body.photos)
    }

    // Recalculate rating when condition or equipment changes
    const needsRatingRecalc =
      'condition' in body || 'equipment' in body

    if (needsRatingRecalc) {
      // Fetch current playground to get existing values for fields not in the patch
      const current = await db.playground.findUnique({ where: { id } })
      if (!current) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      const condition = 'condition' in body ? body.condition : current.condition
      const equipmentStr =
        'equipment' in body
          ? typeof body.equipment === 'string'
            ? body.equipment
            : JSON.stringify(body.equipment || [])
          : current.equipment

      body.rating = calcRating(condition, equipmentStr)
    }

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
